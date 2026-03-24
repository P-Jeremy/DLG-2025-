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

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const songRepository = new SongRepository();
const userRepository = new UserMongoRepository();
const emailService = new NodemailerEmailService();
const fileUploadService = new S3FileUploadService();

const getSongsUsecase = new GetSongsUsecase(songRepository);
const addSongUsecase = new AddSong(songRepository, userRepository, emailService, fileUploadService);

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

export default router;
