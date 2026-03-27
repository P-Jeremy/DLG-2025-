import { Song } from '../../src/domain/models/Song';
import { SongRepository } from '../../src/infrastructure/repositories/songRepository';
import { insertTestSongs } from '../helpers/insertTestSongs';
import { SongNotFoundError } from '../../src/domain/errors/DomainError';

describe('SongRepository integration test', () => {
  let songRepository: SongRepository;

  beforeAll(() => {
    songRepository = new SongRepository();
  });

  it('should map all fields correctly when retrieving a song', async () => {
    const songsData = [
      {
        title: 'Repo Song',
        author: 'Repo Artist',
        tab: 'tabs',
        lyrics: 'lyrics',
      },
    ];
    await insertTestSongs(songsData);

    const songs = await songRepository.getAll('title');

    expect(songs.length).toBeGreaterThanOrEqual(1);
    const repoSong = songs.find((s) => s.title === 'Repo Song');
    expect(repoSong).toBeDefined();
    expect(repoSong?.author).toBe('Repo Artist');
    expect(repoSong instanceof Song).toBe(true);
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
      }),
    ).rejects.toThrow(SongNotFoundError);
  });
});
