import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();
const controller = new AuthController();

router.post('/register', async (req: Request, res: Response) => {
  await controller.register(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await controller.login(req, res);
});

router.get('/activate/:token', async (req: Request, res: Response) => {
  await controller.activateAccount(req, res);
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  await controller.forgotPassword(req, res);
});

router.post('/reset-password', async (req: Request, res: Response) => {
  await controller.resetPassword(req, res);
});

export default router;
