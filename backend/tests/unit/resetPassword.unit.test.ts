import { ResetPassword } from '../../src/application/usecases/ResetPassword';
import { Token, TokenScope } from '../../src/domain/models/Token';
import { TokenExpiredError, TokenAlreadyUsedError, TokenInvalidError, UserNotFoundError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../src/domain/interfaces/ITokenRepository';
import type { IPasswordHasher } from '../../src/application/interfaces/IPasswordHasher';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildActiveUser = (): User =>
  new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('old-hashed-password'),
    isAdmin: false,
    isActive: true,
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

const buildMockPasswordHasher = (overrides: Partial<IPasswordHasher> = {}): IPasswordHasher => ({
  hash: jest.fn().mockResolvedValue('new-hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('ResetPassword use case', () => {
  it('should update the user password when token is valid', async () => {
    const user = buildActiveUser();
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('valid-reset-token'),
      scope: TokenScope.RESET_PASSWORD,
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
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);
    const result = await usecase.execute({ token: 'valid-reset-token', newPassword: 'new-password' });

    expect(result.success).toBe(true);
    expect(user.password.toString()).toBe('new-hashed-password');
    expect(userRepository.update).toHaveBeenCalledWith(user);
    expect(tokenRepository.markAsUsed).toHaveBeenCalledWith('token-id');
  });

  it('should hash the new password using the password hasher', async () => {
    const user = buildActiveUser();
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('valid-reset-token'),
      scope: TokenScope.RESET_PASSWORD,
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
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);
    await usecase.execute({ token: 'valid-reset-token', newPassword: 'new-password' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
  });

  it('should throw TokenInvalidError when token is not found', async () => {
    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(null),
    });
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({ token: 'unknown-token', newPassword: 'new-password' }),
    ).rejects.toThrow(TokenInvalidError);
  });

  it('should throw TokenExpiredError when token is expired', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('expired-token'),
      scope: TokenScope.RESET_PASSWORD,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({ token: 'expired-token', newPassword: 'new-password' }),
    ).rejects.toThrow(TokenExpiredError);
  });

  it('should throw TokenAlreadyUsedError when token is already used', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'user-id-1',
      tokenHash: Token.hashRawToken('used-token'),
      scope: TokenScope.RESET_PASSWORD,
      expiresAt: new Date(Date.now() + 1000),
      usedAt: new Date(),
      createdAt: new Date(),
    });

    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(token),
    });
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({ token: 'used-token', newPassword: 'new-password' }),
    ).rejects.toThrow(TokenAlreadyUsedError);
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const token = new Token({
      id: 'token-id',
      userId: 'unknown-user',
      tokenHash: Token.hashRawToken('valid-token'),
      scope: TokenScope.RESET_PASSWORD,
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
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({ token: 'valid-token', newPassword: 'new-password' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should not call update when token is invalid', async () => {
    const userRepository = buildMockUserRepository();
    const tokenRepository = buildMockTokenRepository({
      findByHash: jest.fn().mockResolvedValue(null),
    });
    const passwordHasher = buildMockPasswordHasher();

    const usecase = new ResetPassword(userRepository, tokenRepository, passwordHasher);

    await expect(
      usecase.execute({ token: 'bad-token', newPassword: 'new-password' }),
    ).rejects.toThrow();

    expect(userRepository.update).not.toHaveBeenCalled();
  });
});
