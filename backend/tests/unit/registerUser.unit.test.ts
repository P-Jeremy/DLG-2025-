import { RegisterUser } from '../../src/application/usecases/RegisterUser';
import { EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { IEmailService } from '../../src/domain/interfaces/IEmailService';
import type { IPasswordHasher } from '../../src/domain/interfaces/IPasswordHasher';
import type { User } from '../../src/domain/models/User';

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
  findAll: jest.fn().mockResolvedValue([]),
  setAdminRole: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((user: User) => Promise.resolve({ ...user, id: 'generated-id' })),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildMockEmailService = (overrides: Partial<IEmailService> = {}): IEmailService => ({
  sendActivationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendNewSongNotification: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockPasswordHasher = (overrides: Partial<IPasswordHasher> = {}): IPasswordHasher => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('RegisterUser use case', () => {
  it('should register a user and return a userId', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    const result = await usecase.execute({ email: 'user@example.com', pseudo: 'john', password: 'pass123' });

    expect(result).toHaveProperty('userId');
    expect(result.userId).toBe('generated-id');
  });

  it('should save the user with isActive false and isAdmin false', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await usecase.execute({ email: 'user@example.com', pseudo: 'john', password: 'pass123' });

    const savedUser = (repository.save as jest.Mock).mock.calls[0][0] as User;
    expect(savedUser.isActive).toBe(false);
    expect(savedUser.isAdmin).toBe(false);
    expect(savedUser.isDeleted).toBe(false);
    expect(savedUser.titleNotif).toBe(true);
  });

  it('should save the user with an activation token', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await usecase.execute({ email: 'user@example.com', pseudo: 'john', password: 'pass123' });

    const savedUser = (repository.save as jest.Mock).mock.calls[0][0] as User;
    expect(savedUser.tokens).toHaveLength(1);
    expect(savedUser.tokens[0].used_token).toBeTruthy();
  });

  it('should send an activation email with the generated token', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await usecase.execute({ email: 'user@example.com', pseudo: 'john', password: 'pass123' });

    const savedUser = (repository.save as jest.Mock).mock.calls[0][0] as User;
    const activationToken = savedUser.tokens[0].used_token;
    expect(emailService.sendActivationEmail).toHaveBeenCalledWith('user@example.com', activationToken);
  });

  it('should throw EmailAlreadyTakenError when email is already in use', async () => {
    const repository = buildMockUserRepository({
      findByEmail: jest.fn().mockResolvedValue({ id: 'existing-id' }),
    });
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await expect(
      usecase.execute({ email: 'taken@example.com', pseudo: 'john', password: 'pass123' }),
    ).rejects.toThrow(EmailAlreadyTakenError);
  });

  it('should throw PseudoAlreadyTakenError when pseudo is already in use', async () => {
    const repository = buildMockUserRepository({
      findByPseudo: jest.fn().mockResolvedValue({ id: 'existing-id' }),
    });
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await expect(
      usecase.execute({ email: 'user@example.com', pseudo: 'taken', password: 'pass123' }),
    ).rejects.toThrow(PseudoAlreadyTakenError);
  });

  it('should throw when email format is invalid', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await expect(
      usecase.execute({ email: 'not-an-email', pseudo: 'john', password: 'pass123' }),
    ).rejects.toThrow('Invalid email format');
  });

  it('should throw when pseudo is empty', async () => {
    const repository = buildMockUserRepository();
    const emailService = buildMockEmailService();
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new RegisterUser(repository, emailService, passwordHasher);

    await expect(
      usecase.execute({ email: 'user@example.com', pseudo: '', password: 'pass123' }),
    ).rejects.toThrow('Pseudo cannot be empty');
  });
});
