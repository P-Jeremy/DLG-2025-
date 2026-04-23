import mongoose, { Schema, Document } from 'mongoose';

export interface TokenDocument extends Document {
  userId: string;
  tokenHash: string;
  scope: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const tokenSchema = new Schema<TokenDocument>({
  userId: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  scope: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const TokenModel = mongoose.model<TokenDocument>('Token', tokenSchema);
