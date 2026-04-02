import { BcryptPasswordHasher } from '../../src/infrastructure/services/BcryptPasswordHasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  describe('hash', () => {
    it('should return a hashed string different from the plain password', async () => {
      const plain = 'my-secret-password';

      const hashed = await hasher.hash(plain);

      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should produce different hashes for the same input (salt randomness)', async () => {
      const plain = 'my-secret-password';

      const hash1 = await hasher.hash(plain);
      const hash2 = await hasher.hash(plain);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true when plain matches the hash', async () => {
      const plain = 'correct-password';
      const hashed = await hasher.hash(plain);

      const result = await hasher.compare(plain, hashed);

      expect(result).toBe(true);
    });

    it('should return false when plain does not match the hash', async () => {
      const hashed = await hasher.hash('correct-password');

      const result = await hasher.compare('wrong-password', hashed);

      expect(result).toBe(false);
    });
  });
});
