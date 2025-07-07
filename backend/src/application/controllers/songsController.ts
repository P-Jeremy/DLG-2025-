import { Request, Response } from 'express';
import { GetSongsUsecase } from '../../domain/usecases/getSongs';
import { SongRepository } from '../../infrastructure/repositories/songRepository';

const songRepository = new SongRepository();
const getSongsUsecase = new GetSongsUsecase(songRepository);

export class SongsController {
  async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const songs = await getSongsUsecase.execute();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch songs' });
    }
  }
}