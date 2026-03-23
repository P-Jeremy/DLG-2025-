import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/authenticate';

const router = Router();
const controller = new UserController();

router.patch('/me/notifications', authenticate, async (req: Request, res: Response) => {
  await controller.updateNotifications(req, res);
});

export default router;
