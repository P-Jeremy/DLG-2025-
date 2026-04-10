import { Request, Response, NextFunction } from 'express';

const HTTP_SERVER_ERROR_THRESHOLD = 500;
const HTTP_CLIENT_ERROR_THRESHOLD = 400;

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const arrivedAt = new Date();
  const start = arrivedAt.getTime();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= HTTP_SERVER_ERROR_THRESHOLD ? 'ERROR'
      : res.statusCode >= HTTP_CLIENT_ERROR_THRESHOLD ? 'WARN'
      : 'INFO';
    console.log(`[${arrivedAt.toISOString()}] [HTTP] [${level}] ${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`);
  });

  next();
}
