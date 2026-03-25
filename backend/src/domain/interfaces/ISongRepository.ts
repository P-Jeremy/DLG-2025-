import type { ISong } from './Song';

export type SongSortField = 'title' | 'author';

export interface ISongRepository {
  getAll(sortBy: SongSortField): Promise<ISong[]>;
  findByTagId(tagId: string): Promise<ISong[]>;
  findById(id: string): Promise<ISong | null>;
  removeTagFromAll(tagId: string): Promise<void>;
  setTag(songId: string, tagId: string): Promise<void>;
  save(song: ISong): Promise<ISong>;
}
