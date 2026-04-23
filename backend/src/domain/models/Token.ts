import crypto from 'crypto';

export enum TokenScope {
  RESET_PASSWORD = 'RESET_PASSWORD',
  VERIFY_ACCOUNT = 'VERIFY_ACCOUNT',
}

const TOKEN_EXPIRY_MS: Record<TokenScope, number> = {
  [TokenScope.RESET_PASSWORD]: 10 * 60 * 1000,
  [TokenScope.VERIFY_ACCOUNT]: 72 * 60 * 60 * 1000,
};

export class Token {
  id?: string;
  userId: string;
  tokenHash: string;
  scope: TokenScope;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;

  constructor(props: {
    id?: string;
    userId: string;
    tokenHash: string;
    scope: TokenScope;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.scope = props.scope;
    this.expiresAt = props.expiresAt;
    this.usedAt = props.usedAt;
    this.createdAt = props.createdAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  static hashRawToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  static generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static expiryFor(scope: TokenScope): Date {
    return new Date(Date.now() + TOKEN_EXPIRY_MS[scope]);
  }
}
