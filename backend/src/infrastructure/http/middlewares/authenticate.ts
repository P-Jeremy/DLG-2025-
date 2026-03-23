import type { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../services/JwtService';

const BEARER_PREFIX = 'Bearer ';

const jwtService = new JwtService();

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  try {
    const payload = jwtService.verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
