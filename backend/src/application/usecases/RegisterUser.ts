import crypto from 'crypto';
import { User } from '../../domain/models/User';
import { Email } from '../../domain/value-objects/Email';
import { Pseudo } from '../../domain/value-objects/Pseudo';
import { HashedPassword } from '../../domain/value-objects/HashedPassword';
import { EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IEmailService } from '../../domain/interfaces/IEmailService';
import type { IPasswordHasher } from '../../domain/interfaces/IPasswordHasher';

const TOKEN_BYTE_LENGTH = 32;

export interface RegisterUserInput {
  email: string;
  pseudo: string;
  password: string;
}

export interface RegisterUserOutput {
  userId: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = new Email(input.email);
    const pseudo = new Pseudo(input.pseudo);

    const existingByEmail = await this.userRepository.findByEmail(email.toString());
    if (existingByEmail) {
      throw new EmailAlreadyTakenError();
    }

    const existingByPseudo = await this.userRepository.findByPseudo(pseudo.toString());
    if (existingByPseudo) {
      throw new PseudoAlreadyTakenError();
    }

    const hashedPasswordValue = await this.passwordHasher.hash(input.password);
    const hashedPassword = new HashedPassword(hashedPasswordValue);

    const activationToken = crypto.randomBytes(TOKEN_BYTE_LENGTH).toString('hex');

    const user = new User({
      email,
      pseudo,
      password: hashedPassword,
      isAdmin: false,
      isActive: false,
      isDeleted: false,
      titleNotif: true,
      tokens: [{ used_token: activationToken }],
    });

    const savedUser = await this.userRepository.save(user);

    try {
      await this.emailService.sendActivationEmail(email.toString(), activationToken);
    } catch (error: unknown) {
      console.error('Failed to send activation email:', error);
    }

    return { userId: savedUser.id! };
  }
}
