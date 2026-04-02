import type { Request, Response } from 'express';
import { RegisterUser } from '../../../application/usecases/RegisterUser';
import { LoginUser } from '../../../application/usecases/LoginUser';
import { ActivateAccount } from '../../../application/usecases/ActivateAccount';
import { RequestPasswordReset } from '../../../application/usecases/RequestPasswordReset';
import { ResetPassword } from '../../../application/usecases/ResetPassword';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import type { IEmailService } from '../../../application/interfaces/IEmailService';
import type { IPasswordHasher } from '../../../application/interfaces/IPasswordHasher';
import type { IJwtService } from '../../../application/interfaces/IJwtService';
import type { LoginUserInput } from '../../../application/usecases/LoginUser';
import type { ResetPasswordInput } from '../../../application/usecases/ResetPassword';
import { getHttpStatusForError, getErrorMessage } from '../utils/errorHandler';

export class AuthController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly emailService: IEmailService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const { email, pseudo, password, apiKey } = req.body;
    const validApiKey = process.env.USER_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      res.status(403).json({ message: 'Clé d\'accès invalide' });
      return;
    }

    try {
      const usecase = new RegisterUser(this.userRepository, this.emailService, this.passwordHasher);
      const result = await usecase.execute({ email, pseudo, password });
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
      const usecase = new ActivateAccount(this.userRepository);
      const result = await usecase.execute({ token: String(req.params.token) });
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new RequestPasswordReset(this.userRepository, this.emailService);
      const result = await usecase.execute({ email: req.body.email });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new ResetPassword(this.userRepository, this.passwordHasher);
      const result = await usecase.execute(req.body as ResetPasswordInput);
      res.json(result);
    } catch (error) {
      const status = getHttpStatusForError(error);
      const message = getErrorMessage(error);
      res.status(status).json({ message });
    }
  }
}
