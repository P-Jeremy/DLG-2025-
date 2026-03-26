import type { IUserRepository } from '../../domain/interfaces/IUserRepository';

export interface GetUsersOutput {
  id: string;
  email: string;
  pseudo: string;
  isAdmin: boolean;
}

export class GetUsers {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<GetUsersOutput[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id!,
      email: user.email.toString(),
      pseudo: user.pseudo.toString(),
      isAdmin: user.isAdmin,
    }));
  }
}
