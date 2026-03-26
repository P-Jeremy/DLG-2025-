import type { Request, Response } from 'express';
import type { GetSongsUsecase } from '../../../application/usecases/GetSongs';
import type { GetSongsByTag } from '../../../application/usecases/GetSongsByTag';
import type { AddSong } from '../../../application/usecases/AddSong';
import type { UpdateSong } from '../../../application/usecases/UpdateSong';
import type { DeleteSong } from '../../../application/usecases/DeleteSong';
import { SongDeserializer, MissingFieldError, InvalidTagsError } from '../deserializers/SongDeserializer';
import { SongNotFoundError } from '../../../domain/errors/DomainError';

export class SongsController {
  private readonly deserializer = new SongDeserializer();

  constructor(
    private readonly getSongsUsecase: GetSongsUsecase,
    private readonly getSongsByTagUsecase: GetSongsByTag,
    private readonly addSongUsecase: AddSong,
    private readonly updateSongUsecase: UpdateSong,
    private readonly deleteSongUsecase: DeleteSong,
  ) {}

  async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const tagId = typeof req.query.tagId === 'string' ? req.query.tagId : undefined;

      if (tagId) {
        const songs = await this.getSongsByTagUsecase.execute({ tagId });
        res.json(songs);
        return;
      }

      const sortBy = this.deserializer.deserializeSortField(req.query.sortBy);
      const songs = await this.getSongsUsecase.execute(sortBy);
      res.json(songs);
    } catch {
      res.status(500).json({ message: 'Failed to fetch songs' });
    }
  }

  async addSong(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ message: 'Tab image file is required' });
      return;
    }

    try {
      const input = this.deserializer.deserializeAddSong(req.body as Record<string, string>, req.file);
      const { song } = await this.addSongUsecase.execute(input);
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof MissingFieldError || error instanceof InvalidTagsError) {
        res.status(400).json({ message: error.message });
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to add song';
      res.status(500).json({ message });
    }
  }

  async updateSong(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string;

    try {
      const input = this.deserializer.deserializeUpdateSong(
        id,
        req.body as Record<string, string>,
        req.file,
      );
      const { song } = await this.updateSongUsecase.execute(input);
      res.status(200).json(song);
    } catch (error) {
      if (error instanceof SongNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error instanceof MissingFieldError || error instanceof InvalidTagsError) {
        res.status(400).json({ message: error.message });
        return;
      }
      const message = error instanceof Error ? error.message : 'Failed to update song';
      res.status(500).json({ message });
    }
  }

  async deleteSong(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string;

    try {
      await this.deleteSongUsecase.execute({ songId: id });
      res.status(204).send();
    } catch (error) {
      if (error instanceof SongNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to delete song' });
    }
  }
}
