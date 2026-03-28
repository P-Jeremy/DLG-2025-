import '@testing-library/jest-dom';
import { decodeJwtPayload } from './jwt';

const buildToken = (payload: object): string => {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
};

const futureExp = Math.floor(Date.now() / 1000) + 3600;
const pastExp = Math.floor(Date.now() / 1000) - 3600;

describe('Unit | Utils | decodeJwtPayload', () => {
  it('returns the payload for a valid token without expiration', () => {
    const token = buildToken({ userId: 'u1', email: 'a@b.com', isAdmin: false });

    const result = decodeJwtPayload(token);

    expect(result).toEqual({ userId: 'u1', email: 'a@b.com', isAdmin: false });
  });

  it('returns the payload for a valid token with a future expiration', () => {
    const token = buildToken({ userId: 'u1', email: 'a@b.com', isAdmin: true, exp: futureExp });

    const result = decodeJwtPayload(token);

    expect(result).not.toBeNull();
    expect(result?.userId).toBe('u1');
    expect(result?.isAdmin).toBe(true);
  });

  it('returns null for a token with an expired exp claim', () => {
    const token = buildToken({ userId: 'u1', email: 'a@b.com', isAdmin: false, exp: pastExp });

    const result = decodeJwtPayload(token);

    expect(result).toBeNull();
  });

  it('returns null for a token with only one segment (no payload)', () => {
    const result = decodeJwtPayload('onlyone');

    expect(result).toBeNull();
  });

  it('returns null for a token whose payload is not valid base64 JSON', () => {
    const result = decodeJwtPayload('header.!!!notbase64!!!.signature');

    expect(result).toBeNull();
  });

  it('returns null for an empty string', () => {
    const result = decodeJwtPayload('');

    expect(result).toBeNull();
  });

  it('handles url-safe base64 characters (- and _) correctly', () => {
    const payload = { userId: 'u1', email: 'a@b.com', isAdmin: false };
    const standard = btoa(JSON.stringify(payload));
    const urlSafe = standard.replace(/\+/g, '-').replace(/\//g, '_');
    const token = `header.${urlSafe}.signature`;

    const result = decodeJwtPayload(token);

    expect(result).toEqual(payload);
  });
});
