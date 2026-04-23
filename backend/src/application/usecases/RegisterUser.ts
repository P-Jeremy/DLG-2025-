import { Token, TokenScope } from '../../domain/models/Token';
import { User } from '../../domain/models/User';
import { Email } from '../../domain/value-objects/Email';
import { Pseudo } from '../../domain/value-objects/Pseudo';
import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import { EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../domain/interfaces/ITokenRepository';
import type { IPasswordHasher } from '../interfaces/IPasswordHasher';

export interface RegisterUserInput {
  email: string;
  pseudo: string;
  password: string;
  clientUrl: string;
}

export interface RegisterUserOutput {
  userId: string;
  activationLink: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenRepository: ITokenRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = new Email(input.email);
    const pseudo = new Pseudo(input.pseudo);

    const existingByEmail = await this.userRepository.findByEmail(email.toString());
    if (existingByEmail) throw new EmailAlreadyTakenError();

    const existingByPseudo = await this.userRepository.findByPseudo(pseudo.toString());
    if (existingByPseudo) throw new PseudoAlreadyTakenError();

    const hashedPasswordValue = await this.passwordHasher.hash(input.password);
    const hashedPassword = new HashedPassword(hashedPasswordValue);

    const user = new User({
      email,
      pseudo,
      password: hashedPassword,
      isAdmin: false,
      isActive: false,
      isDeleted: false,
    });

    const savedUser = await this.userRepository.save(user);

    const rawToken = Token.generateRawToken();
    const tokenHash = Token.hashRawToken(rawToken);

    await this.tokenRepository.invalidatePreviousTokens(savedUser.id!, TokenScope.VERIFY_ACCOUNT);
    await this.tokenRepository.save(new Token({
      userId: savedUser.id!,
      tokenHash,
      scope: TokenScope.VERIFY_ACCOUNT,
      expiresAt: Token.expiryFor(TokenScope.VERIFY_ACCOUNT),
      usedAt: null,
      createdAt: new Date(),
    }));

    const activationLink = `${input.clientUrl}/activate/${rawToken}`;
    return { userId: savedUser.id!, activationLink };
  }
}
