import { User } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByPseudo(pseudo: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;
  findAllWithTitleNotif(): Promise<User[]>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
