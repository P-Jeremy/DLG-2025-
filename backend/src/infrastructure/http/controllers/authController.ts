import type { Request, Response } from 'express';
import { RegisterUser } from '../../../application/usecases/RegisterUser';
import { LoginUser } from '../../../application/usecases/LoginUser';
import { ActivateAccount } from '../../../application/usecases/ActivateAccount';
import { ResetPassword } from '../../../application/usecases/ResetPassword';
import { GenerateAdminResetLink } from '../../../application/usecases/GenerateAdminResetLink';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import type { ITokenRepository } from '../../../domain/interfaces/ITokenRepository';
import type { IPasswordHasher } from '../../../application/interfaces/IPasswordHasher';
import type { IJwtService } from '../../../application/interfaces/IJwtService';
import type { LoginUserInput } from '../../../application/usecases/LoginUser';
import type { ResetPasswordInput } from '../../../application/usecases/ResetPassword';
import { getHttpStatusForError, getErrorMessage } from '../utils/errorHandler';

export class AuthController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenRepository: ITokenRepository,
    private readonly clientUrl: string,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const { email, pseudo, password, apiKey } = req.body;
    const validApiKey = process.env.USER_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      res.status(403).json({ message: 'Clé d\'accès invalide' });
      return;
    }

    try {
      const usecase = new RegisterUser(this.userRepository, this.tokenRepository, this.passwordHasher);
      const result = await usecase.execute({ email, pseudo, password, clientUrl: this.clientUrl });
      res.status(201).json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new LoginUser(this.userRepository, this.jwtService, this.passwordHasher);
      const result = await usecase.execute(req.body as LoginUserInput);
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error, 'Invalid credentials');
      res.status(status).json({ message });
    }
  }

  async activateAccount(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new ActivateAccount(this.userRepository, this.tokenRepository);
      const result = await usecase.execute({ rawToken: String(req.params.token) });
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new ResetPassword(this.userRepository, this.tokenRepository, this.passwordHasher);
      const result = await usecase.execute(req.body as ResetPasswordInput);
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }

  async generateAdminResetLink(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new GenerateAdminResetLink(this.userRepository, this.tokenRepository);
      const result = await usecase.execute({
        userId: req.params.userId,
        clientUrl: this.clientUrl,
      });
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }
}
