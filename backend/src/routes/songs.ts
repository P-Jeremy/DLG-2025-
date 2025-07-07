import { Router } from 'express';
import { SongModel } from '../infrastructure/models/songModel';

const router = Router();

router.get('/songs', async (req, res) => {
  try {
    const songs = await SongModel.find().exec();
    res.json(songs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch songs' });
  }
});

export default router;
