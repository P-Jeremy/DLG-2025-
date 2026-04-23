import { Token, TokenScope } from '../../src/domain/models/Token';

describe('Token domain model', () => {
  const baseProps = {
    userId: 'user-123',
    tokenHash: 'abc123',
    scope: TokenScope.VERIFY_ACCOUNT,
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    createdAt: new Date(),
  };

  it('is not expired when expiresAt is in the future', () => {
    const token = new Token(baseProps);
    expect(token.isExpired()).toBe(false);
  });

  it('is expired when expiresAt is in the past', () => {
    const token = new Token({ ...baseProps, expiresAt: new Date(Date.now() - 1) });
    expect(token.isExpired()).toBe(true);
  });

  it('is used when usedAt is set', () => {
    const token = new Token({ ...baseProps, usedAt: new Date() });
    expect(token.isUsed()).toBe(true);
  });

  it('is not used when usedAt is null', () => {
    const token = new Token(baseProps);
    expect(token.isUsed()).toBe(false);
  });

  it('hashRawToken returns deterministic SHA-256 hash of length 64', () => {
    const hash = Token.hashRawToken('test-token');
    expect(hash).toHaveLength(64);
    expect(hash).toBe(Token.hashRawToken('test-token'));
  });

  it('generateRawToken returns 64-char lowercase hex string', () => {
    const raw = Token.generateRawToken();
    expect(raw).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(raw)).toBe(true);
  });

  it('expiryFor VERIFY_ACCOUNT is approximately 72h in the future', () => {
    const expiry = Token.expiryFor(TokenScope.VERIFY_ACCOUNT);
    const expectedMs = Date.now() + 72 * 60 * 60 * 1000;
    expect(Math.abs(expiry.getTime() - expectedMs)).toBeLessThan(1000);
  });

  it('expiryFor RESET_PASSWORD is approximately 10min in the future', () => {
    const expiry = Token.expiryFor(TokenScope.RESET_PASSWORD);
    const expectedMs = Date.now() + 10 * 60 * 1000;
    expect(Math.abs(expiry.getTime() - expectedMs)).toBeLessThan(1000);
  });
});
