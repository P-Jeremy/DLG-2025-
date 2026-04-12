import type { Request, Response } from 'express';
import { UpdateNotificationPreferences } from '../../../application/usecases/UpdateNotificationPreferences';
import { GetUsers } from '../../../application/usecases/GetUsers';
import { SetUserRole } from '../../../application/usecases/SetUserRole';
import { CannotModifyOwnRoleError, UserNotFoundError } from '../../../domain/errors/DomainError';
import type { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import type { AuthenticatedRequest } from '../middlewares/authenticate';

export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  async updateNotifications(req: Request, res: Response): Promise<void> {
    const { userId } = (req as AuthenticatedRequest).user;
    try {
      const usecase = new UpdateNotificationPreferences(this.userRepository);
      const result = await usecase.execute({
        userId,
        titleNotif: req.body.titleNotif,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async listUsers(_req: Request, res: Response): Promise<void> {
    try {
      const usecase = new GetUsers(this.userRepository);
      const result = await usecase.execute();
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async setRole(req: Request, res: Response): Promise<void> {
    const { userId } = (req as AuthenticatedRequest).user;
    if (typeof req.body.isAdmin !== 'boolean') {
      res.status(400).json({ message: 'isAdmin must be a boolean' });
      return;
    }
    try {
      const usecase = new SetUserRole(this.userRepository);
      const result = await usecase.execute({
        requesterId: userId,
        targetUserId: String(req.params.id),
        isAdmin: req.body.isAdmin,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof CannotModifyOwnRoleError) {
        res.status(403).json({ message: error.message });
        return;
      }
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
