import { CannotModifyOwnRoleError, UserNotFoundError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';

export interface SetUserRoleInput {
  requesterId: string;
  targetUserId: string;
  isAdmin: boolean;
}

export interface SetUserRoleOutput {
  id: string;
  email: string;
  pseudo: string;
  isAdmin: boolean;
}

export class SetUserRole {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: SetUserRoleInput): Promise<SetUserRoleOutput> {
    if (input.requesterId === input.targetUserId) {
      throw new CannotModifyOwnRoleError();
    }

    const target = await this.userRepository.findById(input.targetUserId);
    if (!target) {
      throw new UserNotFoundError();
    }

    const updated = await this.userRepository.setAdminRole(input.targetUserId, input.isAdmin);
    return {
      id: updated.id!,
      email: updated.email.toString(),
      pseudo: updated.pseudo.toString(),
      isAdmin: updated.isAdmin,
    };
  }
}
