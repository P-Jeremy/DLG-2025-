import { SetUserRole } from '../../src/application/usecases/SetUserRole';
import { CannotModifyOwnRoleError, UserNotFoundError } from '../../src/domain/errors/DomainError';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildUser = (overrides: { id: string; isAdmin: boolean }): User =>
  new User({
    id: overrides.id,
    email: new Email('user@example.com'),
    pseudo: new Pseudo('user'),
    password: new HashedPassword('hashed-password'),
    isAdmin: overrides.isAdmin,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [],
  });

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
  findAll: jest.fn().mockResolvedValue([]),
  setAdminRole: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
  update: jest.fn().mockResolvedValue(null),
  ...overrides,
});

describe('SetUserRole use case', () => {
  it('sets isAdmin to true for a target user', async () => {
    const target = buildUser({ id: 'target-id', isAdmin: false });
    const updated = buildUser({ id: 'target-id', isAdmin: true });
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(target),
      setAdminRole: jest.fn().mockResolvedValue(updated),
    });
    const usecase = new SetUserRole(repository);

    const result = await usecase.execute({ requesterId: 'requester-id', targetUserId: 'target-id', isAdmin: true });

    expect(result.isAdmin).toBe(true);
    expect(repository.setAdminRole).toHaveBeenCalledWith('target-id', true);
  });

  it('sets isAdmin to false for a target user', async () => {
    const target = buildUser({ id: 'target-id', isAdmin: true });
    const updated = buildUser({ id: 'target-id', isAdmin: false });
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(target),
      setAdminRole: jest.fn().mockResolvedValue(updated),
    });
    const usecase = new SetUserRole(repository);

    const result = await usecase.execute({ requesterId: 'requester-id', targetUserId: 'target-id', isAdmin: false });

    expect(result.isAdmin).toBe(false);
    expect(repository.setAdminRole).toHaveBeenCalledWith('target-id', false);
  });

  it('throws CannotModifyOwnRoleError when requester targets themselves', async () => {
    const repository = buildMockUserRepository();
    const usecase = new SetUserRole(repository);

    await expect(
      usecase.execute({ requesterId: 'same-id', targetUserId: 'same-id', isAdmin: false }),
    ).rejects.toThrow(CannotModifyOwnRoleError);
  });

  it('does not call setAdminRole when requester targets themselves', async () => {
    const repository = buildMockUserRepository();
    const usecase = new SetUserRole(repository);

    await expect(
      usecase.execute({ requesterId: 'same-id', targetUserId: 'same-id', isAdmin: false }),
    ).rejects.toThrow();

    expect(repository.setAdminRole).not.toHaveBeenCalled();
  });

  it('throws UserNotFoundError when target user does not exist', async () => {
    const repository = buildMockUserRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const usecase = new SetUserRole(repository);

    await expect(
      usecase.execute({ requesterId: 'requester-id', targetUserId: 'unknown-id', isAdmin: true }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
