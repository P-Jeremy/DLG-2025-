import type { ISong } from './Song';

export interface ISongRepository {
  getAll(): Promise<ISong[]>;
}
