import type { ISongRepository, SongSortField } from '../interfaces/ISongRepository';
import type { ISong } from '../interfaces/Song';

export class GetSongsUsecase {
  constructor(private readonly songRepo: ISongRepository) {}

  async execute(sortBy: SongSortField = 'title'): Promise<ISong[]> {
    return this.songRepo.getAll(sortBy);
  }
}
