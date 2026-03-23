import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/authenticate';
import { UserMongoRepository } from '../../repositories/userRepository';

const router = Router();

const userRepository = new UserMongoRepository();
const controller = new UserController(userRepository);

router.patch('/me/notifications', authenticate, async (req: Request, res: Response) => {
  await controller.updateNotifications(req, res);
});

export default router;
