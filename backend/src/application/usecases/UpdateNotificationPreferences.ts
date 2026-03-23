import { UserNotFoundError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';

export interface UpdateNotificationPreferencesInput {
  userId: string;
  titleNotif: boolean;
}

export interface UpdateNotificationPreferencesOutput {
  titleNotif: boolean;
}

export class UpdateNotificationPreferences {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: UpdateNotificationPreferencesInput): Promise<UpdateNotificationPreferencesOutput> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    user.titleNotif = input.titleNotif;

    await this.userRepository.update(user);

    return { titleNotif: user.titleNotif };
  }
}
