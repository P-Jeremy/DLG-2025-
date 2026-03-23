import { Router, Request, Response } from 'express';
import { SongsController } from '../controllers/songsController';
import { GetSongsUsecase } from '../../../domain/usecases/getSongs';
import { SongRepository } from '../../repositories/songRepository';

const router = Router();
const songRepository = new SongRepository();
const getSongsUsecase = new GetSongsUsecase(songRepository);
const controller = new SongsController(getSongsUsecase);

router.get('/songs', async (req: Request, res: Response) => {
  await controller.getSongs(req, res);
});

export default router;
