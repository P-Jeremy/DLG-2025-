import { ActivateAccount } from '../../src/application/usecases/ActivateAccount';
import { InvalidActivationTokenError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
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
    titleNotif: true,
    tokens: [{ used_token: 'valid-activation-token' }],
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

describe('ActivateAccount use case', () => {
  it('should activate the user account and clear tokens', async () => {
    const user = buildInactiveUser();
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(user),
    });
    const usecase = new ActivateAccount(repository);

    const result = await usecase.execute({ token: 'valid-activation-token' });

    expect(result.success).toBe(true);
    expect(user.isActive).toBe(true);
    expect(user.tokens).toHaveLength(0);
    expect(repository.update).toHaveBeenCalledWith(user);
  });

  it('should return success true when activation succeeds', async () => {
    const user = buildInactiveUser();
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(user),
    });
    const usecase = new ActivateAccount(repository);

    const result = await usecase.execute({ token: 'valid-activation-token' });

    expect(result).toEqual({ success: true });
  });

  it('should throw InvalidActivationTokenError when token is not found', async () => {
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(null),
    });
    const usecase = new ActivateAccount(repository);

    await expect(
      usecase.execute({ token: 'unknown-token' }),
    ).rejects.toThrow(InvalidActivationTokenError);
  });

  it('should not call update when token is invalid', async () => {
    const repository = buildMockUserRepository({
      findByResetToken: jest.fn().mockResolvedValue(null),
    });
    const usecase = new ActivateAccount(repository);

    await expect(usecase.execute({ token: 'bad-token' })).rejects.toThrow();

    expect(repository.update).not.toHaveBeenCalled();
  });
});
