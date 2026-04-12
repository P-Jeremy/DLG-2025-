import { Router, Request, Response } from 'express';
import { PlaylistsController } from '../controllers/playlistsController';
import { GetPlaylist } from '../../../application/usecases/GetPlaylist';
import { ReorderPlaylist } from '../../../application/usecases/ReorderPlaylist';
import { AddSongToPlaylist } from '../../../application/usecases/AddSongToPlaylist';
import { RemoveSongFromPlaylist } from '../../../application/usecases/RemoveSongFromPlaylist';
import { GetAllPlaylists } from '../../../application/usecases/GetAllPlaylists';
import { CreatePlaylist } from '../../../application/usecases/CreatePlaylist';
import { RenamePlaylist } from '../../../application/usecases/RenamePlaylist';
import { DeletePlaylist } from '../../../application/usecases/DeletePlaylist';
import { SongRepository } from '../../repositories/songRepository';
import { PlaylistRepository } from '../../repositories/playlistRepository';
import { MetaRepository } from '../../repositories/metaRepository';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

export function createPlaylistsRouter(): Router {
  const router = Router();

  const songRepository = new SongRepository();
  const playlistRepository = new PlaylistRepository();
  const metaRepository = new MetaRepository();

  const getPlaylistUsecase = new GetPlaylist(songRepository, playlistRepository);
  const reorderPlaylistUsecase = new ReorderPlaylist(playlistRepository, metaRepository);
  const addSongToPlaylistUsecase = new AddSongToPlaylist(songRepository, playlistRepository, metaRepository);
  const removeSongFromPlaylistUsecase = new RemoveSongFromPlaylist(songRepository, playlistRepository, metaRepository);
  const getAllPlaylistsUsecase = new GetAllPlaylists(playlistRepository);
  const createPlaylistUsecase = new CreatePlaylist(playlistRepository, metaRepository);
  const renamePlaylistUsecase = new RenamePlaylist(playlistRepository, metaRepository);
  const deletePlaylistUsecase = new DeletePlaylist(playlistRepository, metaRepository);

  const controller = new PlaylistsController(
    getPlaylistUsecase,
    reorderPlaylistUsecase,
    addSongToPlaylistUsecase,
    removeSongFromPlaylistUsecase,
    getAllPlaylistsUsecase,
    createPlaylistUsecase,
    renamePlaylistUsecase,
    deletePlaylistUsecase,
  );

  router.get('/playlists', async (req: Request, res: Response) => {
    await controller.getAllPlaylists(req, res);
  });

  router.post('/playlists', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.createPlaylist(req, res);
  });

  router.get('/playlists/:playlistName', async (req: Request, res: Response) => {
    await controller.getPlaylist(req, res);
  });

  router.put('/playlists/:playlistName', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.reorderPlaylist(req, res);
  });

  router.patch('/playlists/:playlistName', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.renamePlaylist(req, res);
  });

  router.delete('/playlists/:playlistName', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.deletePlaylist(req, res);
  });

  router.post('/playlists/:playlistName/songs', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.addSongToPlaylist(req, res);
  });

  router.delete('/playlists/:playlistName/songs/:songId', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.removeSongFromPlaylist(req, res);
  });

  return router;
}
