import { UserNotFoundError, AccountNotActiveError, InvalidPasswordError } from '../../domain/errors/DomainError';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IPasswordHasher } from '../interfaces/IPasswordHasher';
import type { IJwtService } from '../interfaces/IJwtService';

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
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());

    if (!user || user.isDeleted) {
      throw new UserNotFoundError();
    }

    if (!user.isActive) {
      throw new AccountNotActiveError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.password.toString());
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
