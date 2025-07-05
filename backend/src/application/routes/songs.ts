import { Router, Request, Response } from 'express';
import { SongsController } from '../controllers/songsController';

const router = Router();
const controller = new SongsController();

router.get('/songs', async (req: Request, res: Response) => {
  await controller.getSongs(req, res);
});

export default router;
