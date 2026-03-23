import { UpdateNotificationPreferences } from '../../src/application/usecases/UpdateNotificationPreferences';
import { UserNotFoundError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildUserWithTitleNotif = (titleNotif: boolean): User =>
  new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('hashed-password'),
    isAdmin: false,
    isActive: true,
    isDeleted: false,
    titleNotif,
    tokens: [],
  });

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

describe('UpdateNotificationPreferences use case', () => {
  it('should update titleNotif to false and return the new value', async () => {
    const user = buildUserWithTitleNotif(true);
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(user),
    });
    const usecase = new UpdateNotificationPreferences(repository);

    const result = await usecase.execute({ userId: 'user-id-1', titleNotif: false });

    expect(result.titleNotif).toBe(false);
    expect(user.titleNotif).toBe(false);
    expect(repository.update).toHaveBeenCalledWith(user);
  });

  it('should update titleNotif to true and return the new value', async () => {
    const user = buildUserWithTitleNotif(false);
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(user),
    });
    const usecase = new UpdateNotificationPreferences(repository);

    const result = await usecase.execute({ userId: 'user-id-1', titleNotif: true });

    expect(result.titleNotif).toBe(true);
    expect(user.titleNotif).toBe(true);
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const usecase = new UpdateNotificationPreferences(repository);

    await expect(
      usecase.execute({ userId: 'unknown-id', titleNotif: false }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should not call update when user is not found', async () => {
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const usecase = new UpdateNotificationPreferences(repository);

    await expect(
      usecase.execute({ userId: 'unknown-id', titleNotif: false }),
    ).rejects.toThrow();

    expect(repository.update).not.toHaveBeenCalled();
  });
});
