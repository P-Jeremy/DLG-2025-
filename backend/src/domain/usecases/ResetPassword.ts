import bcrypt from 'bcryptjs';
import { HashedPassword } from '../value-objects/HashedPassword';
import { DomainError } from '../errors/DomainError';
import type { IUserRepository } from '../interfaces/IUserRepository';

const BCRYPT_ROUNDS = 10;

export class InvalidResetTokenError extends DomainError {
  constructor() {
    super('Invalid reset token');
  }
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  success: boolean;
}

export class ResetPassword {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const user = await this.userRepository.findByResetToken(input.token);

    if (!user) {
      throw new InvalidResetTokenError();
    }

    const hashedPasswordValue = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
    user.password = new HashedPassword(hashedPasswordValue);
    user.tokens = [];

    await this.userRepository.update(user);

    return { success: true };
  }
}
