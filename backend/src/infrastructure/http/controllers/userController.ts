import type { Request, Response } from 'express';
import { UpdateNotificationPreferences, UserNotFoundError } from '../../../domain/usecases/UpdateNotificationPreferences';
import { UserMongoRepository } from '../../repositories/userRepository';

const userRepository = new UserMongoRepository();

export class UserController {
  async updateNotifications(req: Request, res: Response): Promise<void> {
    try {
      const usecase = new UpdateNotificationPreferences(userRepository);
      const result = await usecase.execute({
        userId: req.user!.userId,
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
