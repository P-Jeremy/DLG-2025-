import { Token, TokenScope } from '../../domain/models/Token';
import { UserNotFoundError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../domain/interfaces/ITokenRepository';

export interface GenerateAdminResetLinkInput {
  userId: string;
  clientUrl: string;
}

export interface GenerateAdminResetLinkOutput {
  resetLink: string;
}

export class GenerateAdminResetLink {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(input: GenerateAdminResetLinkInput): Promise<GenerateAdminResetLinkOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user || user.isDeleted) throw new UserNotFoundError();

    const rawToken = Token.generateRawToken();
    const tokenHash = Token.hashRawToken(rawToken);

    await this.tokenRepository.invalidatePreviousTokens(input.userId, TokenScope.RESET_PASSWORD);
    await this.tokenRepository.save(new Token({
      userId: input.userId,
      tokenHash,
      scope: TokenScope.RESET_PASSWORD,
      expiresAt: Token.expiryFor(TokenScope.RESET_PASSWORD),
      usedAt: null,
      createdAt: new Date(),
    }));

    const resetLink = `${input.clientUrl}/reset-password/${rawToken}`;
    return { resetLink };
  }
}
