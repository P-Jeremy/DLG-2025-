

import { Song } from '../../src/domain/models/Song';
import { SongRepository } from '../../src/infrastructure/repositories/songRepository';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { insertTestTags } from '../helpers/insertTestTags';


describe('SongRepository integration test', () => {
  let songRepository: SongRepository;

  beforeAll(() => {
    songRepository = new SongRepository();
  });

  it('should save and retrieve songs correctly', async () => {
    // given
    const tags = [{ name: 'toto' }];
    const insertedTags = await insertTestTags(tags);
    const typedTags = insertedTags as Array<{ _id: string; name: string }>;
    const songsData = [
      {
        title: 'Repo Song',
        author: 'Repo Artist',
        tab: 'tabs',
        lyrics: 'lyrics',
        tags: typedTags.map((tag) => tag._id),
      },
    ];
    await insertTestSongs(songsData);
    const expectedTags = typedTags.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
    }));

    const expectedSongs = [
      {
        title: songsData[0].title,
        author: songsData[0].author,
        lyrics: songsData[0].lyrics,
        tab: songsData[0].tab,
        tags: expectedTags,
      },
    ];

    // when
    const songs = await songRepository.getAll();

    // then
    expect(songs).toHaveLength(1);
    expect(songs).toMatchObject(expectedSongs);
    expect(songs[0] instanceof Song).toBe(true);
  });
});
