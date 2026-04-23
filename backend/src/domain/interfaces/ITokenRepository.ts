import type { Token, TokenScope } from '../models/Token';

export interface ITokenRepository {
  save(token: Token): Promise<Token>;
  findByHash(tokenHash: string, scope: TokenScope): Promise<Token | null>;
  invalidatePreviousTokens(userId: string, scope: TokenScope): Promise<void>;
  markAsUsed(tokenId: string): Promise<void>;
}
