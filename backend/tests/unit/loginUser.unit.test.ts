import bcrypt from 'bcryptjs';
import { LoginUser, UserNotFoundError, AccountNotActiveError, InvalidPasswordError } from '../../src/domain/usecases/LoginUser';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { IJwtService, JwtPayload } from '../../src/domain/interfaces/IJwtService';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildActiveUser = async (passwordPlain: string): Promise<User> => {
  const hash = await bcrypt.hash(passwordPlain, 10);
  return new User({
    id: 'user-id-1',
    email: new Email('user@example.com'),
    pseudo: new Pseudo('john'),
    password: new HashedPassword(hash),
    isAdmin: false,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [],
  });
};

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

const buildMockJwtService = (): IJwtService => ({
  generateToken: jest.fn().mockReturnValue('signed-token'),
  verifyToken: jest.fn().mockReturnValue({} as JwtPayload),
});

describe('LoginUser use case', () => {
  it('should return token, isAdmin, and pseudo on successful login', async () => {
    const user = await buildActiveUser('correct-password');
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(user) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    const result = await usecase.execute({ email: 'user@example.com', password: 'correct-password' });

    expect(result.token).toBe('signed-token');
    expect(result.isAdmin).toBe(false);
    expect(result.pseudo).toBe('john');
  });

  it('should generate JWT with correct payload', async () => {
    const user = await buildActiveUser('correct-password');
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(user) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    await usecase.execute({ email: 'user@example.com', password: 'correct-password' });

    expect(jwtService.generateToken).toHaveBeenCalledWith({
      userId: 'user-id-1',
      email: 'user@example.com',
      isAdmin: false,
    });
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(null) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    await expect(
      usecase.execute({ email: 'unknown@example.com', password: 'pass' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should throw UserNotFoundError when user is deleted', async () => {
    const user = await buildActiveUser('pass');
    user.isDeleted = true;
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(user) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    await expect(
      usecase.execute({ email: 'user@example.com', password: 'pass' }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('should throw AccountNotActiveError when account is not yet activated', async () => {
    const user = await buildActiveUser('pass');
    user.isActive = false;
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(user) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    await expect(
      usecase.execute({ email: 'user@example.com', password: 'pass' }),
    ).rejects.toThrow(AccountNotActiveError);
  });

  it('should throw InvalidPasswordError when password does not match', async () => {
    const user = await buildActiveUser('correct-password');
    const repository = buildMockUserRepository({ findByEmail: jest.fn().mockResolvedValue(user) });
    const jwtService = buildMockJwtService();
    const usecase = new LoginUser(repository, jwtService);

    await expect(
      usecase.execute({ email: 'user@example.com', password: 'wrong-password' }),
    ).rejects.toThrow(InvalidPasswordError);
  });
});
