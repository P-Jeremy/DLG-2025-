import { Song } from '../../src/domain/models/Song';
import { SongRepository } from '../../src/infrastructure/repositories/songRepository';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { insertTestTags } from '../helpers/insertTestTags';
import { SongNotFoundError } from '../../src/domain/errors/DomainError';

describe('SongRepository integration test', () => {
  let songRepository: SongRepository;

  beforeAll(() => {
    songRepository = new SongRepository();
  });

  it('should map all fields correctly when retrieving a song', async () => {
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

    const songs = await songRepository.getAll('title');

    expect(songs).toHaveLength(1);
    expect(songs).toMatchObject(expectedSongs);
    expect(songs[0] instanceof Song).toBe(true);
  });

  it('should return songs sorted by title ascending by default', async () => {
    await insertTestSongs([
      { title: 'Zebra Song', author: 'Artist B', tab: 'tab', lyrics: 'lyrics' },
      { title: 'Apple Song', author: 'Artist C', tab: 'tab', lyrics: 'lyrics' },
      { title: 'Mango Song', author: 'Artist A', tab: 'tab', lyrics: 'lyrics' },
    ]);

    const songs = await songRepository.getAll('title');

    const titlesInOrder = songs.map((s) => s.title);
    expect(titlesInOrder.indexOf('Apple Song')).toBeLessThan(titlesInOrder.indexOf('Mango Song'));
    expect(titlesInOrder.indexOf('Mango Song')).toBeLessThan(titlesInOrder.indexOf('Zebra Song'));
  });

  it('should return songs sorted by author ascending', async () => {
    await insertTestSongs([
      { title: 'Song C', author: 'Zebra Artist', tab: 'tab', lyrics: 'lyrics' },
      { title: 'Song A', author: 'Apple Artist', tab: 'tab', lyrics: 'lyrics' },
      { title: 'Song B', author: 'Mango Artist', tab: 'tab', lyrics: 'lyrics' },
    ]);

    const songs = await songRepository.getAll('author');

    expect(songs.map((s) => s.author)).toEqual(['Apple Artist', 'Mango Artist', 'Zebra Artist']);
  });
});

describe('SongRepository.update() integration test', () => {
  let songRepository: SongRepository;

  beforeAll(() => {
    songRepository = new SongRepository();
  });

  it('successfully updates a song fields', async () => {
    const inserted = await insertTestSongs([
      { title: 'Original Title', author: 'Original Artist', tab: 'https://s3/original.png', lyrics: '<p>original</p>' },
    ]);
    const insertedSong = inserted[0] as { _id: { toString(): string } };
    const songId = insertedSong._id.toString();

    const updated = await songRepository.update({
      id: songId,
      title: 'Updated Title',
      author: 'Updated Artist',
      lyrics: '<p>updated</p>',
      tab: 'https://s3/updated.png',
      tags: [],
    });

    expect(updated instanceof Song).toBe(true);
    expect(updated.id).toBe(songId);
    expect(updated.title).toBe('Updated Title');
    expect(updated.author).toBe('Updated Artist');
    expect(updated.lyrics).toBe('<p>updated</p>');
    expect(updated.tab).toBe('https://s3/updated.png');
  });

  it('throws SongNotFoundError when updating a non-existent song', async () => {
    await expect(
      songRepository.update({
        id: '000000000000000000000099',
        title: 'T',
        author: 'A',
        lyrics: 'L',
        tab: 'https://s3/file.png',
        tags: [],
      }),
    ).rejects.toThrow(SongNotFoundError);
  });
});
