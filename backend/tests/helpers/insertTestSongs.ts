
import { SongModel } from '../../src/infrastructure/models/songModel';
import { ISong } from '../../src/domain/interfaces/Song';

export const insertTestSongs = async (songs: Array<Omit<ISong, 'id' | 'tags'> & { tags?: string[] }>): Promise<unknown[]> => {
  return SongModel.insertMany(songs);
};
