import type { Request, Response } from 'express';
import type { GetPlaylist } from '../../../application/usecases/GetPlaylist';
import type { ReorderPlaylist } from '../../../application/usecases/ReorderPlaylist';
import type { AddSongToPlaylist } from '../../../application/usecases/AddSongToPlaylist';
import type { RemoveSongFromPlaylist } from '../../../application/usecases/RemoveSongFromPlaylist';
import type { GetAllPlaylists } from '../../../application/usecases/GetAllPlaylists';
import type { CreatePlaylist } from '../../../application/usecases/CreatePlaylist';
import type { RenamePlaylist } from '../../../application/usecases/RenamePlaylist';
import type { DeletePlaylist } from '../../../application/usecases/DeletePlaylist';
import {
  InvalidPlaylistSongError,
  PlaylistNotFoundError,
  DuplicatePlaylistError,
  SongNotFoundError,
} from '../../../domain/errors/DomainError';

export class PlaylistsController {
  constructor(
    private readonly getPlaylistUsecase: GetPlaylist,
    private readonly reorderPlaylistUsecase: ReorderPlaylist,
    private readonly addSongToPlaylistUsecase: AddSongToPlaylist,
    private readonly removeSongFromPlaylistUsecase: RemoveSongFromPlaylist,
    private readonly getAllPlaylistsUsecase: GetAllPlaylists,
    private readonly createPlaylistUsecase: CreatePlaylist,
    private readonly renamePlaylistUsecase: RenamePlaylist,
    private readonly deletePlaylistUsecase: DeletePlaylist,
  ) {}

  async getAllPlaylists(_req: Request, res: Response): Promise<void> {
    try {
      const { playlists } = await this.getAllPlaylistsUsecase.execute();
      res.json(playlists);
    } catch {
      res.status(500).json({ message: 'Failed to fetch playlists' });
    }
  }

  async getPlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;

    try {
      const result = await this.getPlaylistUsecase.execute({ playlistName });
      if (!result.playlist) {
        res.status(404).json({ message: 'Playlist not found' });
        return;
      }
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Failed to fetch playlist' });
    }
  }

  async createPlaylist(req: Request, res: Response): Promise<void> {
    const { name } = req.body as { name?: unknown };

    if (!name || typeof name !== 'string') {
      res.status(400).json({ message: 'name is required' });
      return;
    }

    try {
      const { playlist } = await this.createPlaylistUsecase.execute({ name });
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof DuplicatePlaylistError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to create playlist' });
    }
  }

  async renamePlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;
    const { newName } = req.body as { newName?: unknown };

    if (!newName || typeof newName !== 'string') {
      res.status(400).json({ message: 'newName is required' });
      return;
    }

    try {
      const { playlist } = await this.renamePlaylistUsecase.execute({ name: playlistName, newName });
      res.json(playlist);
    } catch (error) {
      if (error instanceof PlaylistNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof DuplicatePlaylistError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to rename playlist' });
    }
  }

  async deletePlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;

    try {
      await this.deletePlaylistUsecase.execute({ name: playlistName });
      res.status(204).send();
    } catch (error) {
      if (error instanceof PlaylistNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to delete playlist' });
    }
  }

  async reorderPlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;
    const { songIds } = req.body as { songIds?: unknown };

    if (!Array.isArray(songIds)) {
      res.status(400).json({ message: 'songIds must be an array' });
      return;
    }

    try {
      const { playlist } = await this.reorderPlaylistUsecase.execute({
        playlistName,
        songIds: songIds.map(String),
      });
      res.json(playlist);
    } catch (error) {
      if (error instanceof InvalidPlaylistSongError) {
        res.status(400).json({ message: error.message });
        return;
      }
      if (error instanceof PlaylistNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to reorder playlist' });
    }
  }

  async addSongToPlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;
    const { songId } = req.body as { songId?: unknown };

    if (!songId || typeof songId !== 'string') {
      res.status(400).json({ message: 'songId is required' });
      return;
    }

    try {
      const { playlist } = await this.addSongToPlaylistUsecase.execute({ playlistName, songId });
      res.status(200).json(playlist);
    } catch (error) {
      if (error instanceof SongNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to add song to playlist' });
    }
  }

  async removeSongFromPlaylist(req: Request, res: Response): Promise<void> {
    const playlistName = req.params['playlistName'] as string;
    const songId = req.params['songId'] as string;

    try {
      const { playlist } = await this.removeSongFromPlaylistUsecase.execute({ playlistName, songId });
      res.status(200).json(playlist);
    } catch (error) {
      if (error instanceof PlaylistNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof SongNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to remove song from playlist' });
    }
  }
}
