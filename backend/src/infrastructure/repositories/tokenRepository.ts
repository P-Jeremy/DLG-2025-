import { Token, TokenScope } from '../../domain/models/Token';
import type { ITokenRepository } from '../../domain/interfaces/ITokenRepository';
import { TokenModel } from '../models/tokenModel';

function docToToken(doc: InstanceType<typeof TokenModel>): Token {
  return new Token({
    id: doc._id.toString(),
    userId: doc.userId,
    tokenHash: doc.tokenHash,
    scope: doc.scope as TokenScope,
    expiresAt: doc.expiresAt,
    usedAt: doc.usedAt,
    createdAt: doc.createdAt,
  });
}

export class TokenMongoRepository implements ITokenRepository {
  async save(token: Token): Promise<Token> {
    const doc = await TokenModel.create({
      userId: token.userId,
      tokenHash: token.tokenHash,
      scope: token.scope,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
      createdAt: token.createdAt,
    });
    return docToToken(doc);
  }

  async findByHash(tokenHash: string, scope: TokenScope): Promise<Token | null> {
    const doc = await TokenModel.findOne({ tokenHash, scope }).exec();
    return doc ? docToToken(doc) : null;
  }

  async invalidatePreviousTokens(userId: string, scope: TokenScope): Promise<void> {
    await TokenModel.deleteMany({ userId, scope, usedAt: null }).exec();
  }

  async markAsUsed(tokenId: string): Promise<void> {
    await TokenModel.findByIdAndUpdate(tokenId, { usedAt: new Date() }).exec();
  }
}
