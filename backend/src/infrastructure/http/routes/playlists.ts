import { Router, Request, Response } from 'express';
import { PlaylistsController } from '../controllers/playlistsController';
import { GetPlaylist } from '../../../application/usecases/GetPlaylist';
import { ReorderPlaylist } from '../../../application/usecases/ReorderPlaylist';
import { AddSongToPlaylist } from '../../../application/usecases/AddSongToPlaylist';
import { RemoveSongFromPlaylist } from '../../../application/usecases/RemoveSongFromPlaylist';
import { SongRepository } from '../../repositories/songRepository';
import { PlaylistRepository } from '../../repositories/playlistRepository';
import { TagRepository } from '../../repositories/tagRepository';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

export function createPlaylistsRouter(): Router {
  const router = Router();

  const tagRepository = new TagRepository();
  const songRepository = new SongRepository();
  const playlistRepository = new PlaylistRepository();

  const getPlaylistUsecase = new GetPlaylist(songRepository, playlistRepository);
  const reorderPlaylistUsecase = new ReorderPlaylist(songRepository, playlistRepository);
  const addSongToPlaylistUsecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);
  const removeSongFromPlaylistUsecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);

  const controller = new PlaylistsController(
    getPlaylistUsecase,
    reorderPlaylistUsecase,
    addSongToPlaylistUsecase,
    removeSongFromPlaylistUsecase,
  );

  router.get('/playlists/:tagId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.getPlaylist(req, res);
  });

  router.put('/playlists/:tagId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.reorderPlaylist(req, res);
  });

  router.post('/playlists/:tagId/songs', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.addSongToPlaylist(req, res);
  });

  router.delete('/playlists/:tagId/songs/:songId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.removeSongFromPlaylist(req, res);
  });

  return router;
}
