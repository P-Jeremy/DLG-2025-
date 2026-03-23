import bcrypt from 'bcryptjs';
import { DomainError } from '../errors/DomainError';
import type { IUserRepository } from '../interfaces/IUserRepository';
import type { IJwtService } from '../interfaces/IJwtService';

export class UserNotFoundError extends DomainError {
  constructor() {
    super('User not found');
  }
}

export class AccountNotActiveError extends DomainError {
  constructor() {
    super('Account not active');
  }
}

export class InvalidPasswordError extends DomainError {
  constructor() {
    super('Invalid password');
  }
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  isAdmin: boolean;
  pseudo: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user || user.isDeleted) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new AccountNotActiveError();
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password.toString());
    if (!passwordMatches) {
      throw new InvalidPasswordError();
    }

    const token = this.jwtService.generateToken({
      userId: user.id!,
      email: user.email.toString(),
      isAdmin: user.isAdmin,
    });

    return {
      token,
      isAdmin: user.isAdmin,
      pseudo: user.pseudo.toString(),
    };
  }
}
