import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import { UserMongoRepository } from '../../repositories/userRepository';

const router = Router();

const userRepository = new UserMongoRepository();
const controller = new UserController(userRepository);

router.patch('/me/notifications', authenticate, async (req: Request, res: Response) => {
  await controller.updateNotifications(req, res);
});

router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await controller.listUsers(req, res);
});

router.patch('/:id/role', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await controller.setRole(req, res);
});

export default router;
