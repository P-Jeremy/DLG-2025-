import bcrypt from 'bcryptjs';
import { UserModel } from '../../src/infrastructure/models/userModel';

const BCRYPT_ROUNDS = 10;

export interface TestUserProps {
  email: string;
  pseudo: string;
  password: string;
  isActive?: boolean;
  isAdmin?: boolean;
  isDeleted?: boolean;
  titleNotif?: boolean;
  tokens?: { used_token: string }[];
}

export const insertTestUser = async (props: TestUserProps): Promise<{ _id: string; email: string; pseudo: string }> => {
  const hashedPassword = await bcrypt.hash(props.password, BCRYPT_ROUNDS);
  const doc = await UserModel.create({
    email: props.email,
    pseudo: props.pseudo,
    password: hashedPassword,
    isActive: props.isActive ?? false,
    isAdmin: props.isAdmin ?? false,
    isDeleted: props.isDeleted ?? false,
    titleNotif: props.titleNotif ?? true,
    tokens: props.tokens ?? [],
  });
  return { _id: doc._id.toString(), email: doc.email, pseudo: doc.pseudo };
};
