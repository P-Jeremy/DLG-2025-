import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { UserMongoRepository } from '../../repositories/userRepository';
import { JwtService } from '../../services/JwtService';
import { NodemailerEmailService } from '../../services/NodemailerEmailService';
import { BcryptPasswordHasher } from '../../services/BcryptPasswordHasher';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

const userRepository = new UserMongoRepository();
const jwtService = new JwtService();
const emailService = new NodemailerEmailService();
const passwordHasher = new BcryptPasswordHasher();
const controller = new AuthController(userRepository, jwtService, emailService, passwordHasher);

router.use(authRateLimiter);

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
