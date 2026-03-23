import { UserMongoRepository } from '../../src/infrastructure/repositories/userRepository';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';
import { insertTestUser } from '../helpers/insertTestUser';

const buildTestUser = (overrides: Partial<{
  email: string;
  pseudo: string;
  password: string;
  isActive: boolean;
  tokens: { used_token: string }[];
}> = {}): User => {
  return new User({
    email: new Email(overrides.email ?? 'user@example.com'),
    pseudo: new Pseudo(overrides.pseudo ?? 'testuser'),
    password: new HashedPassword(overrides.password ?? 'hashed-password'),
    isAdmin: false,
    isActive: overrides.isActive ?? false,
    isDeleted: false,
    titleNotif: true,
    tokens: overrides.tokens ?? [],
  });
};

describe('UserMongoRepository integration tests', () => {
  let repository: UserMongoRepository;

  beforeAll(() => {
    repository = new UserMongoRepository();
  });

  describe('save', () => {
    it('should persist a user and return it with an id', async () => {
      const user = buildTestUser();

      const saved = await repository.save(user);

      expect(saved.id).toBeTruthy();
      expect(saved.email.toString()).toBe('user@example.com');
      expect(saved.pseudo.toString()).toBe('testuser');
      expect(saved instanceof User).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      await insertTestUser({ email: 'findme@example.com', pseudo: 'findme', password: 'hash' });

      const found = await repository.findByEmail('findme@example.com');

      expect(found).not.toBeNull();
      expect(found!.email.toString()).toBe('findme@example.com');
    });

    it('should return null when no user matches the email', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('findByPseudo', () => {
    it('should find a user by pseudo', async () => {
      await insertTestUser({ email: 'pseudo@example.com', pseudo: 'uniquepseudo', password: 'hash' });

      const found = await repository.findByPseudo('uniquepseudo');

      expect(found).not.toBeNull();
      expect(found!.pseudo.toString()).toBe('uniquepseudo');
    });

    it('should return null when no user matches the pseudo', async () => {
      const found = await repository.findByPseudo('nobodypseudo');

      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const inserted = await insertTestUser({ email: 'byid@example.com', pseudo: 'byiduser', password: 'hash' });

      const found = await repository.findById(inserted._id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(inserted._id);
    });

    it('should return null when no user matches the id', async () => {
      const found = await repository.findById('000000000000000000000001');

      expect(found).toBeNull();
    });
  });

  describe('findByResetToken', () => {
    it('should find a user by a token in the tokens array', async () => {
      const token = 'some-reset-token-abc123';
      await insertTestUser({
        email: 'token@example.com',
        pseudo: 'tokenuser',
        password: 'hash',
        tokens: [{ used_token: token }],
      });

      const found = await repository.findByResetToken(token);

      expect(found).not.toBeNull();
      expect(found!.tokens[0].used_token).toBe(token);
    });

    it('should return null when no user has the given token', async () => {
      const found = await repository.findByResetToken('nonexistent-token');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user fields and return updated user', async () => {
      const user = buildTestUser({ email: 'update@example.com', pseudo: 'updateuser' });
      const saved = await repository.save(user);

      saved.isActive = true;
      saved.titleNotif = false;

      const updated = await repository.update(saved);

      expect(updated.isActive).toBe(true);
      expect(updated.titleNotif).toBe(false);
    });

    it('should clear tokens after update', async () => {
      const token = 'token-to-clear';
      const user = buildTestUser({ tokens: [{ used_token: token }] });
      const saved = await repository.save(user);

      saved.tokens = [];

      const updated = await repository.update(saved);

      expect(updated.tokens).toHaveLength(0);
    });
  });
});
