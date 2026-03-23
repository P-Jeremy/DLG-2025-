import type { Request, Response } from 'express';
import { RegisterUser, EmailAlreadyTakenError, PseudoAlreadyTakenError } from '../../../domain/usecases/RegisterUser';
import { LoginUser, UserNotFoundError, AccountNotActiveError, InvalidPasswordError } from '../../../domain/usecases/LoginUser';
import { ActivateAccount, InvalidActivationTokenError } from '../../../domain/usecases/ActivateAccount';
import { RequestPasswordReset } from '../../../domain/usecases/RequestPasswordReset';
import { ResetPassword, InvalidResetTokenError } from '../../../domain/usecases/ResetPassword';
import { DomainError } from '../../../domain/errors/DomainError';
import { UserMongoRepository } from '../../repositories/userRepository';
import { JwtService } from '../../services/JwtService';
import { NodemailerEmailService } from '../../services/NodemailerEmailService';

const userRepository = new UserMongoRepository();
const jwtService = new JwtService();
const emailService = new NodemailerEmailService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new RegisterUser(userRepository, emailService);
      const result = await usecase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof EmailAlreadyTakenError) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (error instanceof PseudoAlreadyTakenError) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (error instanceof DomainError) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new LoginUser(userRepository, jwtService);
      const result = await usecase.execute(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof UserNotFoundError || error instanceof InvalidPasswordError) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }
      if (error instanceof AccountNotActiveError) {
        res.status(403).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async activateAccount(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new ActivateAccount(userRepository);
      const result = await usecase.execute({ token: req.params.token });
      res.json(result);
    } catch (error) {
      if (error instanceof InvalidActivationTokenError) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new RequestPasswordReset(userRepository, emailService);
      const result = await usecase.execute({ email: req.body.email });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new ResetPassword(userRepository);
      const result = await usecase.execute(req.body);
      res.json(result);
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
