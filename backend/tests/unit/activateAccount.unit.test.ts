import { ActivateAccount } from '../../src/application/usecases/ActivateAccount';
import { Token, TokenScope } from '../../src/domain/models/Token';
import { TokenExpiredError, TokenAlreadyUsedError, TokenInvalidError, UserNotFoundError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../src/domain/interfaces/ITokenRepository';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildInactiveUser = (): User =>
  new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('hashed-password'),
    isAdmin: false,
    isActive: false,
    isDeleted: false,
  });

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  setAdminRole: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
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

describe('ActivateAccount use case', () => {
  it('should activate the user account when token is valid', async () => {
    const user = buildInactiveUser();
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('test-raw-token'),
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: new Date(Date.now() + 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(user),
    });
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);
    const result = await usecase.execute({ rawToken: 'test-raw-token' });

    expect(result.success).toBe(true);
    expect(user.isActive).toBe(true);
    expect(userRepository.update).toHaveBeenCalledWith(user);
    expect(tokenRepository.markAsUsed).toHaveBeenCalledWith('token-id');
  });

  it('should return success true when activation succeeds', async () => {
    const user = buildInactiveUser();
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('test-raw-token'),
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: new Date(Date.now() + 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(user),
    });
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);
    const result = await usecase.execute({ rawToken: 'test-raw-token' });

    expect(result).toEqual({ success: true });
  });

  it('should throw TokenInvalidError when token is not found', async () => {
    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(null),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);

    await expect(
      usecase.execute({ rawToken: 'unknown-token' }),
    ).rejects.toThrow(TokenInvalidError);
  });

  it('should throw TokenExpiredError when token is expired', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('expired-token'),
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);

    await expect(
      usecase.execute({ rawToken: 'expired-token' }),
    ).rejects.toThrow(TokenExpiredError);
  });

  it('should throw TokenAlreadyUsedError when token is already used', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('used-token'),
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: new Date(Date.now() + 1000),
      usedAt: new Date(),
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);

    await expect(
      usecase.execute({ rawToken: 'used-token' }),
    ).rejects.toThrow(TokenAlreadyUsedError);
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'unknown-user',
      tokenHash: Token.hashRawToken('valid-token'),
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: new Date(Date.now() + 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);

    await expect(
      usecase.execute({ rawToken: 'valid-token' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should not call update when token is invalid', async () => {
    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(null),
    });

    const usecase = new ActivateAccount(userRepository, tokenRepository);

    await expect(usecase.execute({ rawToken: 'bad-token' })).rejects.toThrow();

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
