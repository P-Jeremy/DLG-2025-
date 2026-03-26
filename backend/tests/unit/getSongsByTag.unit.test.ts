import { GetSongsByTag } from '../../src/application/usecases/GetSongsByTag';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';

const buildSong = (id: string, title: string): ISong => ({
  id,
  title,
  author: 'Artist',
  lyrics: '',
  tab: '',
});

const buildMockSongRepository = (songs: ISong[]): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findByTagId: jest.fn().mockResolvedValue(songs),
  findById: jest.fn().mockResolvedValue(null),
  removeTagFromAll: jest.fn().mockResolvedValue(undefined),
  removeTagFromSong: jest.fn().mockResolvedValue(undefined),
  setTag: jest.fn().mockResolvedValue(undefined),
  save: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  update: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  deleteById: jest.fn().mockResolvedValue(undefined),
});

const buildMockPlaylistRepository = (playlist: IPlaylist | null): IPlaylistRepository => ({
  findByTagId: jest.fn().mockResolvedValue(playlist),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByTagId: jest.fn().mockResolvedValue(undefined),
  removeSongFromAll: jest.fn().mockResolvedValue(undefined),
});

describe('GetSongsByTag use case', () => {
  it('should return songs ordered by playlist songIds', async () => {
    const songA = buildSong('song-a', 'Alpha');
    const songB = buildSong('song-b', 'Beta');
    const songC = buildSong('song-c', 'Charlie');

    const songRepository = buildMockSongRepository([songA, songB, songC]);
    const playlist: IPlaylist = { tagId: 'tag-id', songIds: ['song-c', 'song-a', 'song-b'] };
    const playlistRepository = buildMockPlaylistRepository(playlist);

    const usecase = new GetSongsByTag(songRepository, playlistRepository);
    const result = await usecase.execute({ tagId: 'tag-id' });

    expect(result.map((s) => s.id)).toEqual(['song-c', 'song-a', 'song-b']);
  });

  it('should return unordered songs when no playlist exists', async () => {
    const songA = buildSong('song-a', 'Alpha');
    const songB = buildSong('song-b', 'Beta');

    const songRepository = buildMockSongRepository([songA, songB]);
    const playlistRepository = buildMockPlaylistRepository(null);

    const usecase = new GetSongsByTag(songRepository, playlistRepository);
    const result = await usecase.execute({ tagId: 'tag-id' });

    expect(result).toEqual([songA, songB]);
  });

  it('should place songs not in playlist at end', async () => {
    const songA = buildSong('song-a', 'Alpha');
    const songB = buildSong('song-b', 'Beta');
    const songC = buildSong('song-c', 'Charlie');

    const songRepository = buildMockSongRepository([songA, songB, songC]);
    const playlist: IPlaylist = { tagId: 'tag-id', songIds: ['song-b'] };
    const playlistRepository = buildMockPlaylistRepository(playlist);

    const usecase = new GetSongsByTag(songRepository, playlistRepository);
    const result = await usecase.execute({ tagId: 'tag-id' });

    expect(result[0].id).toBe('song-b');
    const remainingIds = result.slice(1).map((s) => s.id);
    expect(remainingIds).toContain('song-a');
    expect(remainingIds).toContain('song-c');
  });
});
