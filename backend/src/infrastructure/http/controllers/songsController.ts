import type { Request, Response } from 'express';
import type { GetSongsUsecase } from '../../../domain/usecases/getSongs';
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
  constructor(private readonly getSongsUsecase: GetSongsUsecase) {}

  async getSongs(req: Request, res: Response): Promise<void> {
    try {
      const sortBy = resolveSortField(req.query.sortBy);
      const songs = await this.getSongsUsecase.execute(sortBy);
      res.json(songs);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch songs' });
    }
  }
}
