import type { ISong } from './Song';

export type SongSortField = 'title' | 'author';

export interface ISongRepository {
  getAll(sortBy: SongSortField): Promise<ISong[]>;
}
