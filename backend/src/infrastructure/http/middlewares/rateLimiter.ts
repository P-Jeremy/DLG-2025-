import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';

const noOpMiddleware = (_req: Request, _res: Response, next: NextFunction): void => next();

export const authRateLimiter = process.env.NODE_ENV === 'test'
  ? noOpMiddleware
  : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  });
