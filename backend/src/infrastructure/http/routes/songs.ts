import { Router, Request, Response } from 'express';
import multer from 'multer';
import { SongsController } from '../controllers/songsController';
import { GetSongsUsecase } from '../../../application/usecases/GetSongs';
import { AddSong } from '../../../application/usecases/AddSong';
import { SongRepository } from '../../repositories/songRepository';
import { UserMongoRepository } from '../../repositories/userRepository';
import { NodemailerEmailService } from '../../services/NodemailerEmailService';
import { S3FileUploadService } from '../../services/S3FileUploadService';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import type { IEventEmitter } from '../../../application/interfaces/IEventEmitter';

const upload = multer({ storage: multer.memoryStorage() });

export function createSongsRouter(eventEmitter: IEventEmitter): Router {
  const router = Router();

  const songRepository = new SongRepository();
  const userRepository = new UserMongoRepository();
  const emailService = new NodemailerEmailService();
  const fileUploadService = new S3FileUploadService();

  const getSongsUsecase = new GetSongsUsecase(songRepository);
  const addSongUsecase = new AddSong(
    songRepository,
    userRepository,
    emailService,
    fileUploadService,
    eventEmitter,
  );

  const controller = new SongsController(getSongsUsecase, addSongUsecase);

  router.get('/songs', async (req: Request, res: Response) => {
    await controller.getSongs(req, res);
  });

  router.post(
    '/songs',
    authenticate,
    requireAdmin,
    upload.single('tab'),
    async (req: Request, res: Response) => {
      await controller.addSong(req, res);
    },
  );

  return router;
}
