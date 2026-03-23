import '../models/tagModel';
import { Schema, model, Document, Types } from 'mongoose';

export interface SongProps {
  title: string;
  author: string;
  lyrics: string;
  tab: string;
  tags?: Array<{ _id: unknown; name: string }>;
}

export interface SongDocument extends SongProps, Document {
  _id: Types.ObjectId;
}


const SongSchema = new Schema<SongDocument>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  lyrics: { type: String, required: true },
  tab: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
}, { timestamps: true });

export const SongModel = model<SongDocument>('songs', SongSchema);
