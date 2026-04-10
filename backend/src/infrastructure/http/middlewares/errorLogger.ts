import { Request, Response, NextFunction } from 'express';

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [HTTP] [ERROR] ${req.method} ${req.path} — ${err.name}: ${err.message}`);
  next(err);
}
