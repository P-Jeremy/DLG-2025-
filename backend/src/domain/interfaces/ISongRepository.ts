import type { ISong } from './Song';

export type SongSortField = 'title' | 'author';

export interface ISongRepository {
  getAll(sortBy: SongSortField): Promise<ISong[]>;
  findById(id: string): Promise<ISong | null>;
  findByIds(ids: string[]): Promise<ISong[]>;
  save(song: ISong): Promise<ISong>;
  update(song: ISong): Promise<ISong>;
  deleteById(id: string): Promise<void>;
}
