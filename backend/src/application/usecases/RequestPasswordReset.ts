import crypto from 'crypto';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IEmailService } from '../../domain/interfaces/IEmailService';

const TOKEN_BYTE_LENGTH = 32;

export interface RequestPasswordResetInput {
  email: string;
}

export interface RequestPasswordResetOutput {
  success: boolean;
}

export class RequestPasswordReset {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {}

  async execute(input: RequestPasswordResetInput): Promise<RequestPasswordResetOutput> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user || user.isDeleted) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(TOKEN_BYTE_LENGTH).toString('hex');
    user.tokens.push({ used_token: resetToken });

    await this.userRepository.update(user);

    try {
      await this.emailService.sendPasswordResetEmail(user.email.toString(), resetToken);
    } catch (emailError) {
      console.error('[RequestPasswordReset] Email send failed:', emailError instanceof Error ? emailError.message : 'Unknown error');
    }

    return { success: true };
  }
}
