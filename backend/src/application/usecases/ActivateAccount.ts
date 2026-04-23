import { Token, TokenScope } from '../../domain/models/Token';
import { TokenExpiredError, TokenAlreadyUsedError, TokenInvalidError, UserNotFoundError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../domain/interfaces/ITokenRepository';

export interface ActivateAccountInput {
  rawToken: string;
}

export interface ActivateAccountOutput {
  success: boolean;
}

export class ActivateAccount {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: ITokenRepository,
  ) {}

  async execute(input: ActivateAccountInput): Promise<ActivateAccountOutput> {
    const tokenHash = Token.hashRawToken(input.rawToken);
    const token = await this.tokenRepository.findByHash(tokenHash, TokenScope.VERIFY_ACCOUNT);

    if (!token) throw new TokenInvalidError();
    if (token.isExpired()) throw new TokenExpiredError();
    if (token.isUsed()) throw new TokenAlreadyUsedError();

    const user = await this.userRepository.findById(token.userId);
    if (!user) throw new UserNotFoundError();

    user.isActive = true;
    await this.userRepository.update(user);
    await this.tokenRepository.markAsUsed(token.id!);

    return { success: true };
  }
}
