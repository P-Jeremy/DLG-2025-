import bcrypt from 'bcryptjs';
import type { IPasswordHasher } from '../../application/interfaces/IPasswordHasher';

const BCRYPT_ROUNDS = 10;

export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
