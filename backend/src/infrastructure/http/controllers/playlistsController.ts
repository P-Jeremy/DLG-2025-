import type { Request, Response } from 'express';
import type { GetPlaylist } from '../../../application/usecases/GetPlaylist';
import type { ReorderPlaylist } from '../../../application/usecases/ReorderPlaylist';
import type { AddSongToPlaylist } from '../../../application/usecases/AddSongToPlaylist';
import { InvalidPlaylistSongError, TagNotFoundError, SongNotFoundError } from '../../../domain/errors/DomainError';

export class PlaylistsController {
  constructor(
    private readonly getPlaylistUsecase: GetPlaylist,
    private readonly reorderPlaylistUsecase: ReorderPlaylist,
    private readonly addSongToPlaylistUsecase: AddSongToPlaylist,
  ) {}

  async getPlaylist(req: Request, res: Response): Promise<void> {
    const { tagId } = req.params;

    try {
      const result = await this.getPlaylistUsecase.execute({ tagId });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Failed to fetch playlist' });
    }
  }

  async reorderPlaylist(req: Request, res: Response): Promise<void> {
    const { tagId } = req.params;
    const { songIds } = req.body as { songIds?: unknown };

    if (!Array.isArray(songIds)) {
      res.status(400).json({ message: 'songIds must be an array' });
      return;
    }

    try {
      const { playlist } = await this.reorderPlaylistUsecase.execute({
        tagId,
        songIds: songIds.map(String),
      });
      res.json(playlist);
    } catch (error) {
      if (error instanceof InvalidPlaylistSongError) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to reorder playlist' });
    }
  }

  async addSongToPlaylist(req: Request, res: Response): Promise<void> {
    const { tagId } = req.params;
    const { songId } = req.body as { songId?: unknown };

    if (!songId || typeof songId !== 'string') {
      res.status(400).json({ message: 'songId is required' });
      return;
    }

    try {
      const { playlist } = await this.addSongToPlaylistUsecase.execute({ tagId, songId });
      res.status(200).json(playlist);
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof SongNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to add song to playlist' });
    }
  }
}
