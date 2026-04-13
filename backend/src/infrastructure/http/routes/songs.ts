import { Router, Request, Response } from 'express';
import multer from 'multer';
import { SongsController } from '../controllers/songsController';
import { GetSongsUsecase } from '../../../application/usecases/GetSongs';
import { AddSong } from '../../../application/usecases/AddSong';
import { UpdateSong } from '../../../application/usecases/UpdateSong';
import { DeleteSong } from '../../../application/usecases/DeleteSong';
import { SongRepository } from '../../repositories/songRepository';
import { PlaylistRepository } from '../../repositories/playlistRepository';
import { UserMongoRepository } from '../../repositories/userRepository';
import { ResendEmailService } from '../../services/ResendEmailService';
import { S3FileUploadService } from '../../services/S3FileUploadService';
import { MetaRepository } from '../../repositories/metaRepository';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';
import type { IEventEmitter } from '../../../application/interfaces/IEventEmitter';

const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_SIZE_BYTES } });

export function createSongsRouter(eventEmitter: IEventEmitter): Router {
  const router = Router();

  const songRepository = new SongRepository();
  const playlistRepository = new PlaylistRepository();
  const userRepository = new UserMongoRepository();
  const emailService = new ResendEmailService();
  const fileUploadService = new S3FileUploadService();
  const metaRepository = new MetaRepository();

  const getSongsUsecase = new GetSongsUsecase(songRepository);
  const addSongUsecase = new AddSong(
    songRepository,
    userRepository,
    emailService,
    fileUploadService,
    eventEmitter,
    metaRepository,
  );
  const updateSongUsecase = new UpdateSong(songRepository, fileUploadService, eventEmitter, metaRepository);
  const deleteSongUsecase = new DeleteSong(songRepository, playlistRepository, fileUploadService, metaRepository, eventEmitter);

  const controller = new SongsController(
    getSongsUsecase,
    addSongUsecase,
    updateSongUsecase,
    deleteSongUsecase,
  );

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

  router.put(
    '/songs/:id',
    authenticate,
    requireAdmin,
    upload.single('tab'),
    async (req: Request, res: Response) => {
      await controller.updateSong(req, res);
    },
  );

  router.delete('/songs/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.deleteSong(req, res);
  });

  return router;
}
