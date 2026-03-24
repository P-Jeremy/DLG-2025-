import { ResetPassword } from '../../src/application/usecases/ResetPassword';
import { InvalidResetTokenError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { IPasswordHasher } from '../../src/domain/interfaces/IPasswordHasher';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildUserWithResetToken = (): User =>
  new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('old-hashed-password'),
    isAdmin: false,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [{ used_token: 'valid-reset-token' }],
  });

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildMockPasswordHasher = (overrides: Partial<IPasswordHasher> = {}): IPasswordHasher => ({
  hash: jest.fn().mockResolvedValue('new-hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('ResetPassword use case', () => {
  it('should update the user password and clear tokens', async () => {
    const user = buildUserWithResetToken();
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(user),
    });
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new ResetPassword(repository, passwordHasher);

    const result = await usecase.execute({ token: 'valid-reset-token', newPassword: 'new-password' });

    expect(result.success).toBe(true);
    expect(user.password.toString()).toBe('new-hashed-password');
    expect(user.tokens).toHaveLength(0);
    expect(repository.update).toHaveBeenCalledWith(user);
  });

  it('should hash the new password using the password hasher', async () => {
    const user = buildUserWithResetToken();
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(user),
    });
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new ResetPassword(repository, passwordHasher);

    await usecase.execute({ token: 'valid-reset-token', newPassword: 'new-password' });

    expect(passwordHasher.hash).toHaveBeenCalledWith('new-password');
  });

  it('should throw InvalidResetTokenError when token is not found', async () => {
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(null),
    });
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new ResetPassword(repository, passwordHasher);

    await expect(
      usecase.execute({ token: 'unknown-token', newPassword: 'new-password' }),
    ).rejects.toThrow(InvalidResetTokenError);
  });

  it('should not call update when token is invalid', async () => {
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(null),
    });
    const passwordHasher = buildMockPasswordHasher();
    const usecase = new ResetPassword(repository, passwordHasher);

    await expect(
      usecase.execute({ token: 'bad-token', newPassword: 'new-password' }),
    ).rejects.toThrow();

    expect(repository.update).not.toHaveBeenCalled();
  });
});
