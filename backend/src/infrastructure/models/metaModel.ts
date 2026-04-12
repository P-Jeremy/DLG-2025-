import { Schema, model, Document } from 'mongoose';

const SINGLETON_KEY = 'global';

export interface MetaDocument extends Document {
  singleton: string;
  updatedAt: Date;
}

const MetaSchema = new Schema<MetaDocument>({
  singleton: { type: String, required: true, unique: true, default: SINGLETON_KEY },
  updatedAt: { type: Date, required: true },
});

export const MetaModel = model<MetaDocument>('meta', MetaSchema);
