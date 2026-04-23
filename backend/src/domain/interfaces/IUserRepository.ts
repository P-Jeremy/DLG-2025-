import { User } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByPseudo(pseudo: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  setAdminRole(userId: string, isAdmin: boolean): Promise<User>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
