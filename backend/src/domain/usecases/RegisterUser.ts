import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Email } from '../value-objects/Email';
import { Pseudo } from '../value-objects/Pseudo';
import { HashedPassword } from '../value-objects/HashedPassword';
import { DomainError } from '../errors/DomainError';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type { IEmailService } from '../interfaces/IEmailService';

const BCRYPT_ROUNDS = 10;
const TOKEN_BYTE_LENGTH = 32;

export class EmailAlreadyTakenError extends DomainError {
  constructor() {
    super('Email already taken');
  }
}

export class PseudoAlreadyTakenError extends DomainError {
  constructor() {
    super('Pseudo already taken');
  }
}

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

    const hashedPasswordValue = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
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

    await this.emailService.sendActivationEmail(email.toString(), activationToken);

    return { userId: savedUser.id! };
  }
}
