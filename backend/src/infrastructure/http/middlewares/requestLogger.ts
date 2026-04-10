import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const arrivedAt = new Date();
  const start = arrivedAt.getTime();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${arrivedAt.toISOString()}] [HTTP] [${level}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}
