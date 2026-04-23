import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { UserMongoRepository } from '../../repositories/userRepository';
import { TokenMongoRepository } from '../../repositories/tokenRepository';
import { JwtService } from '../../services/JwtService';
import { BcryptPasswordHasher } from '../../services/BcryptPasswordHasher';
import { authRateLimiter } from '../middlewares/rateLimiter';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

const userRepository = new UserMongoRepository();
const tokenRepository = new TokenMongoRepository();
const jwtService = new JwtService();
const passwordHasher = new BcryptPasswordHasher();
const clientUrl = process.env.CLIENT_URL ?? '';

const controller = new AuthController(
  userRepository,
  jwtService,
  passwordHasher,
  tokenRepository,
  clientUrl,
);

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

router.post('/reset-password', async (req: Request, res: Response) => {
  await controller.resetPassword(req, res);
});

router.post('/admin/reset-link/:userId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  await controller.generateAdminResetLink(req, res);
});

export default router;
