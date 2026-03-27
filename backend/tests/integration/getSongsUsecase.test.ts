import { GetSongsUsecase } from '../../src/application/usecases/GetSongs';
import { SongRepository } from '../../src/infrastructure/repositories/songRepository';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { Song } from '../../src/domain/models/Song';

describe('GetSongsUsecase integration test', () => {
  let usecase: GetSongsUsecase;

  beforeAll(() => {
    usecase = new GetSongsUsecase(new SongRepository());
  });

  it('should retrieve a list of songs', async () => {
    const songsData = [
      {
        title: 'Song One',
        author: 'Artist 1',
        tab: 'tab1',
        lyrics: 'lyrics1',
      },
      {
        title: 'Song Two',
        author: 'Artist 2',
        tab: 'tab2',
        lyrics: 'lyrics2',
      },
    ];
    await insertTestSongs(songsData);

    const songs = await usecase.execute('title');

    const songOne = songs.find((s) => s.title === 'Song One');
    const songTwo = songs.find((s) => s.title === 'Song Two');

    expect(songOne).toBeDefined();
    expect(songTwo).toBeDefined();
    expect(songOne instanceof Song).toBe(true);
    expect(songOne?.author).toBe('Artist 1');
  });
});
