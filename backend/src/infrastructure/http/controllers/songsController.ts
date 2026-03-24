import type { Request, Response } from 'express';
import type { GetSongsUsecase } from '../../../application/usecases/GetSongs';
import type { AddSong } from '../../../application/usecases/AddSong';
import type { SongSortField } from '../../../domain/interfaces/ISongRepository';

const VALID_SORT_FIELDS: SongSortField[] = ['title', 'author'];
const DEFAULT_SORT_FIELD: SongSortField = 'title';

function resolveSortField(value: unknown): SongSortField {
  if (typeof value === 'string' && (VALID_SORT_FIELDS as string[]).includes(value)) {
    return value as SongSortField;
  }
  return DEFAULT_SORT_FIELD;
}

export class SongsController {
  constructor(
    private readonly getSongsUsecase: GetSongsUsecase,
    private readonly addSongUsecase: AddSong,
  ) {}

  async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const sortBy = resolveSortField(req.query.sortBy);
      const songs = await this.getSongsUsecase.execute(sortBy);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch songs' });
    }
  }

  async addSong(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: 'Tab image file is required' });
        return;
      }

      const { title, author, lyrics, selectedTags } = req.body as {
        title?: string;
        author?: string;
        lyrics?: string;
        selectedTags?: string;
      };

      if (!title || !author || !lyrics) {
        res.status(400).json({ message: 'title, author and lyrics are required' });
        return;
      }

      let tagIds: string[] = [];
      if (selectedTags) {
        try {
          const parsed = JSON.parse(selectedTags) as unknown;
          if (Array.isArray(parsed)) {
            tagIds = parsed.map(String);
          }
        } catch {
          res.status(400).json({ message: 'selectedTags must be a valid JSON array' });
          return;
        }
      }

      const { song } = await this.addSongUsecase.execute({
        title,
        author,
        lyrics,
        tabFile: file,
        tagIds,
      });

      res.status(201).json(song);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add song';
      res.status(500).json({ message });
    }
  }
}
