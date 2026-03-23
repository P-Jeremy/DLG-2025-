import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import { InvalidResetTokenError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IPasswordHasher } from '../../domain/interfaces/IPasswordHasher';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ResetPasswordOutput {
  success: boolean;
}

export class ResetPassword {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const user = await this.userRepository.findByResetToken(input.token);

    if (!user) {
      throw new InvalidResetTokenError();
    }

    const hashedPasswordValue = await this.passwordHasher.hash(input.newPassword);
    user.password = new HashedPassword(hashedPasswordValue);
    user.tokens = [];

    await this.userRepository.update(user);

    return { success: true };
  }
}
