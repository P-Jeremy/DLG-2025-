import { SongModel } from '../../src/infrastructure/models/songModel';
import { ISong } from '../../src/domain/interfaces/Song';

export const insertTestSongs = async (songs: Array<Omit<ISong, 'id'>>): Promise<unknown[]> => {
  return SongModel.insertMany(songs);
};
