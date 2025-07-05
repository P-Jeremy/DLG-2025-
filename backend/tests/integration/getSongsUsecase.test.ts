import { GetSongsUsecase } from '../../src/domain/usecases/getSongs';
import { SongRepository } from '../../src/infrastructure/repositories/songRepository';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { insertTestTags } from '../helpers/insertTestTags';
import { Song } from '../../src/domain/models/Song';
import { Tag } from '../../src/domain/models/Tag';

describe('GetSongsUsecase integration test', () => {
  let usecase: GetSongsUsecase;

  beforeAll(() => {
    usecase = new GetSongsUsecase(new SongRepository());
  });

  it('should retrieve a list of songs', async () => {
    // given
    const tags = [
      { name: 'rock' },
      { name: 'pop' },
      { name: 'jazz' },
    ];
    const insertedTags = await insertTestTags(tags);
    const typedTags = insertedTags as Array<{ _id: string; name: string }>;
    const songsData = [
      {
        title: 'Song Without Tags',
        author: 'Artist 1',
        tab: 'tab1',
        lyrics: 'lyrics1',
        tags: [],
      },
      {
        title: 'Song With Tags',
        author: 'Artist 2',
        tab: 'tab2',
        lyrics: 'lyrics2',
        tags: typedTags.map((tag) => tag._id),
      },
    ];
    await insertTestSongs(songsData);

    // when
    const songs = await usecase.execute();

    // then
    const songWithoutTags = songs.find((s) => s.title === 'Song Without Tags');
    const songWithTags = songs.find((s) => s.title === 'Song With Tags');
    const expected = [
      new Song({
        title: songWithoutTags!.title,
        author: songWithoutTags!.author,
        tab: songWithoutTags!.tab,
        lyrics: songWithoutTags!.lyrics,
        id: songWithoutTags!.id,
        tags: [],
      }),
      new Song({
        title: songWithTags!.title,
        author: songWithTags!.author,
        tab: songWithTags!.tab,
        lyrics: songWithTags!.lyrics,
        id: songWithTags!.id,
        tags: (insertedTags as Array<{ _id: string; name: string }>).map((tag) => new Tag({ id: String(tag._id), name: tag.name })),
      }),
    ];

    const sortByTitle = (a: Song, b: Song) => a.title.localeCompare(b.title);
    expect(songs.sort(sortByTitle)).toEqual(expected.sort(sortByTitle));
  });
});
