import { Token, TokenScope } from '../../domain/models/Token';
import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import { TokenExpiredError, TokenAlreadyUsedError, TokenInvalidError, UserNotFoundError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../domain/interfaces/ITokenRepository';
import type { IPasswordHasher } from '../interfaces/IPasswordHasher';

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
    private readonly tokenRepository: ITokenRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const tokenHash = Token.hashRawToken(input.token);
    const token = await this.tokenRepository.findByHash(tokenHash, TokenScope.RESET_PASSWORD);

    if (!token) throw new TokenInvalidError();
    if (token.isExpired()) throw new TokenExpiredError();
    if (token.isUsed()) throw new TokenAlreadyUsedError();

    const user = await this.userRepository.findById(token.userId);
    if (!user) throw new UserNotFoundError();

    const hashedPasswordValue = await this.passwordHasher.hash(input.newPassword);
    user.password = new HashedPassword(hashedPasswordValue);
    await this.userRepository.update(user);
    await this.tokenRepository.markAsUsed(token.id!);

    return { success: true };
  }
}
