import { Schema, model, Document, Types } from 'mongoose';

export interface PlaylistProps {
  name: string;
  songIds: Types.ObjectId[];
}

export interface PlaylistDocument extends PlaylistProps, Document {
  _id: Types.ObjectId;
}

const PlaylistSchema = new Schema<PlaylistDocument>({
  name: { type: String, required: true, unique: true },
  songIds: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
});

export const PlaylistModel = model<PlaylistDocument>('Playlist', PlaylistSchema);
