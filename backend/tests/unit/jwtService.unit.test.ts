import { JwtService } from '../../src/infrastructure/services/JwtService';
import type { JwtPayload } from '../../src/application/interfaces/IJwtService';

describe('JwtService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const service = new JwtService();

  const payload: JwtPayload = {
    userId: 'user-123',
    email: 'user@example.com',
    isAdmin: false,
  };

  describe('generateToken', () => {
    it('should throw if JWT_SECRET is not set', () => {
      process.env.JWT_SECRET = undefined;

      expect(() => service.generateToken(payload)).toThrow('JWT_SECRET environment variable is not set');
    });

    it('should return a non-empty token string', () => {
      const token = service.generateToken(payload);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('should return the original payload from a valid token', () => {
      const token = service.generateToken(payload);

      const decoded = service.verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.isAdmin).toBe(payload.isAdmin);
    });

    it('should throw when the token is invalid', () => {
      expect(() => service.verifyToken('invalid.token.here')).toThrow();
    });

    it('should throw when the token is signed with a different secret', () => {
      const token = service.generateToken(payload);
      process.env.JWT_SECRET = 'different-secret';

      expect(() => service.verifyToken(token)).toThrow();
    });
  });
});
