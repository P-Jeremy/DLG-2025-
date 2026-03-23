import type { Request, Response } from 'express';
import { UpdateNotificationPreferences } from '../../../application/usecases/UpdateNotificationPreferences';
import { UserNotFoundError } from '../../../domain/errors/DomainError';
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
}
