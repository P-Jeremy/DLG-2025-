import { DomainError } from '../errors/DomainError';
import type { IUserRepository } from '../interfaces/IUserRepository';

export class InvalidActivationTokenError extends DomainError {
  constructor() {
    super('Invalid activation token');
  }
}

export interface ActivateAccountInput {
  token: string;
}

export interface ActivateAccountOutput {
  success: boolean;
}

export class ActivateAccount {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ActivateAccountInput): Promise<ActivateAccountOutput> {
    const user = await this.userRepository.findByResetToken(input.token);

    if (!user) {
      throw new InvalidActivationTokenError();
    }

    user.isActive = true;
    user.tokens = [];

    await this.userRepository.update(user);

    return { success: true };
  }
}
