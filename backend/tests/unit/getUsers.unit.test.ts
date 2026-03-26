import { GetUsers } from '../../src/application/usecases/GetUsers';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildUser = (overrides: { id: string; email: string; pseudo: string; isAdmin: boolean }): User =>
  new User({
    id: overrides.id,
    email: new Email(overrides.email),
    pseudo: new Pseudo(overrides.pseudo),
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

describe('GetUsers use case', () => {
  it('returns all non-deleted users mapped to output shape', async () => {
    const users = [
      buildUser({ id: 'user-1', email: 'alice@example.com', pseudo: 'alice', isAdmin: true }),
      buildUser({ id: 'user-2', email: 'bob@example.com', pseudo: 'bob', isAdmin: false }),
    ];
    const repository = buildMockUserRepository({
      findAll: jest.fn().mockResolvedValue(users),
    });
    const usecase = new GetUsers(repository);

    const result = await usecase.execute();

    expect(result).toEqual([
      { id: 'user-1', email: 'alice@example.com', pseudo: 'alice', isAdmin: true },
      { id: 'user-2', email: 'bob@example.com', pseudo: 'bob', isAdmin: false },
    ]);
  });

  it('returns empty array when no users exist', async () => {
    const repository = buildMockUserRepository({
      findAll: jest.fn().mockResolvedValue([]),
    });
    const usecase = new GetUsers(repository);

    const result = await usecase.execute();

    expect(result).toEqual([]);
  });
});
