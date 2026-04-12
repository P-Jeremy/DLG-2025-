import { Router, Request, Response } from 'express';
import { getMeta } from '../controllers/metaController';

export function createMetaRouter(): Router {
  const router = Router();

  router.get('/meta', async (req: Request, res: Response) => {
    await getMeta(req, res);
  });

  return router;
}
