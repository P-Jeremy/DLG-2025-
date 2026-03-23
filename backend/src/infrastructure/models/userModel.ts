import { Schema, model, Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  pseudo: string;
  password: string;
  avatar: string | null;
  isActive: boolean;
  isAdmin: boolean;
  isDeleted: boolean;
  postNotif: boolean;
  commentNotif: boolean;
  titleNotif: boolean;
  tokens: { used_token: string }[];
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    pseudo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    postNotif: { type: Boolean, default: true },
    commentNotif: { type: Boolean, default: true },
    titleNotif: { type: Boolean, default: true },
    tokens: [{ used_token: String }],
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('users', userSchema);
