import bcrypt from 'bcryptjs';
import { UserModel } from '../../src/infrastructure/models/userModel';

export const insertTestAdmin = async (overrides: Partial<{
  email: string;
  pseudo: string;
}> = {}): Promise<{ email: string; pseudo: string; password: string }> => {
  const password = process.env.ADMIN_API_KEY;
  if (!password) throw new Error('ADMIN_API_KEY must be set in test environment');
  const hashedPassword = await bcrypt.hash(password, 10);
  const email = overrides.email ?? 'admin@dlg.com';
  const pseudo = overrides.pseudo ?? 'admin';

  await UserModel.create({
    email,
    pseudo,
    password: hashedPassword,
    isAdmin: true,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [],
  });

  return { email, pseudo, password };
};
