import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authenticate';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as AuthenticatedRequest).user;
  if (!user || !user.isAdmin) {
    res.status(403).json({ message: 'Forbidden: admin access required' });
    return;
  }
  next();
}
