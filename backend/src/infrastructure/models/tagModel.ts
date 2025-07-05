import { Document, Schema, model, Types } from 'mongoose';


export interface TagProps {
  name: string;
}

export interface TagDocument extends TagProps, Document {
  _id: Types.ObjectId;
}


const TagSchema = new Schema<TagDocument>({
  name: { type: String, required: true },
});

export const TagModel = model<TagDocument>('Tag', TagSchema);
