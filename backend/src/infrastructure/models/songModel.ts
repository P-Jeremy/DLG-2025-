import { Schema, model, Document, Types } from 'mongoose';

export interface SongProps {
  title: string;
  author: string;
  lyrics: string;
  tab: string;
}

export interface SongDocument extends SongProps, Document {
  _id: Types.ObjectId;
}

const SongSchema = new Schema<SongDocument>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  lyrics: { type: String, required: true },
  tab: { type: String, required: true },
}, { timestamps: true });

export const SongModel = model<SongDocument>('songs', SongSchema);
