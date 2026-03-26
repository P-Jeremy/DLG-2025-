import { Schema, model, Document, Types } from 'mongoose';

export interface PlaylistProps {
  tagId: Types.ObjectId;
  songIds: Types.ObjectId[];
}

export interface PlaylistDocument extends PlaylistProps, Document {
  _id: Types.ObjectId;
}

const PlaylistSchema = new Schema<PlaylistDocument>({
  tagId: { type: Schema.Types.ObjectId, ref: 'Tag', required: true, unique: true },
  songIds: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
});

export const PlaylistModel = model<PlaylistDocument>('Playlist', PlaylistSchema);
