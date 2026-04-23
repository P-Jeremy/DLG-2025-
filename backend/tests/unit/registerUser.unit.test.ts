import { RegisterUser } from '../../src/application/usecases/RegisterUser';
import { EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../src/domain/errors/DomainError';
import { Token, TokenScope } from '../../src/domain/models/Token';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../src/domain/interfaces/ITokenRepository';
import type { IPasswordHasher } from '../../src/application/interfaces/IPasswordHasher';
import type { User } from '../../src/domain/models/User';

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  setAdminRole: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((user: User) => Promise.resolve({ ...user, id: 'generated-id' })),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildMockTokenRepository = (overrides: Partial<ITokenRepository> = {}): ITokenRepository => ({
  save: jest.fn().mockResolvedValue(null),
  findByHash: jest.fn().mockResolvedValue(null),
  invalidatePreviousTokens: jest.fn().mockResolvedValue(undefined),
  markAsUsed: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockPasswordHasher = (overrides: Partial<IPasswordHasher> = {}): IPasswordHasher => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('RegisterUser use case', () => {
  it('should register a user and return userId and activationLink', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    const result = await usecase.execute({
      email: 'user@example.com',
      pseudo: 'john',
      password: 'pass123',
      clientUrl: 'http://localhost:3000',
    });

    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('activationLink');
    expect(result.userId).toBe('generated-id');
    expect(result.activationLink).toMatch(/^http:\/\/localhost:3000\/activate\/.+$/);
  });

  it('should save the user with isActive false and isAdmin false', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await usecase.execute({
      email: 'user@example.com',
      pseudo: 'john',
      password: 'pass123',
      clientUrl: 'http://localhost:3000',
    });

    const savedUser = (repository.save as jest.Mock).mock.calls[0][0] as User;
    expect(savedUser.isActive).toBe(false);
    expect(savedUser.isAdmin).toBe(false);
    expect(savedUser.isDeleted).toBe(false);
  });

  it('should create a VERIFY_ACCOUNT token with expiry', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await usecase.execute({
      email: 'user@example.com',
      pseudo: 'john',
      password: 'pass123',
      clientUrl: 'http://localhost:3000',
    });

    const savedToken = (tokenRepository.save as jest.Mock).mock.calls[0][0] as Token;
    expect(savedToken.scope).toBe(TokenScope.VERIFY_ACCOUNT);
    expect(savedToken.usedAt).toBeNull();
    expect(savedToken.isExpired()).toBe(false);
  });

  it('should invalidate previous tokens for the user', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await usecase.execute({
      email: 'user@example.com',
      pseudo: 'john',
      password: 'pass123',
      clientUrl: 'http://localhost:3000',
    });

    expect(tokenRepository.invalidatePreviousTokens).toHaveBeenCalledWith(
      'generated-id',
      TokenScope.VERIFY_ACCOUNT,
    );
  });

  it('should throw EmailAlreadyTakenError when email is already in use', async () => {
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue({ id: 'existing-id' }),
    });
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({
        email: 'taken@example.com',
        pseudo: 'john',
        password: 'pass123',
        clientUrl: 'http://localhost:3000',
      }),
    ).rejects.toThrow(EmailAlreadyTakenError);
  });

  it('should throw PseudoAlreadyTakenError when pseudo is already in use', async () => {
    const repository = buildMockUserRepository({
      findByPseudo: jest.fn().mockResolvedValue({ id: 'existing-id' }),
    });
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({
        email: 'user@example.com',
        pseudo: 'taken',
        password: 'pass123',
        clientUrl: 'http://localhost:3000',
      }),
    ).rejects.toThrow(PseudoAlreadyTakenError);
  });

  it('should throw when email format is invalid', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({
        email: 'not-an-email',
        pseudo: 'john',
        password: 'pass123',
        clientUrl: 'http://localhost:3000',
      }),
    ).rejects.toThrow('Invalid email format');
  });

  it('should throw when pseudo is empty', async () => {
    const repository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({
        email: 'user@example.com',
        pseudo: '',
        password: 'pass123',
        clientUrl: 'http://localhost:3000',
      }),
    ).rejects.toThrow('Pseudo cannot be empty');
  });
});
