import { ReorderPlaylist } from '../../src/application/usecases/ReorderPlaylist';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { InvalidPlaylistSongError } from '../../src/domain/errors/DomainError';

const buildSong = (id: string): ISong => ({
  id,
  title: `Song ${id}`,
  author: 'Artist',
  lyrics: '',
  tab: '',
});

const buildMockSongRepository = (songs: ISong[]): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findByTagId: jest.fn().mockResolvedValue(songs),
  findById: jest.fn().mockResolvedValue(null),
  removeTagFromAll: jest.fn().mockResolvedValue(undefined),
  setTag: jest.fn().mockResolvedValue(undefined),
  save: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
});

const buildMockPlaylistRepository = (overrides: Partial<IPlaylistRepository> = {}): IPlaylistRepository => ({
  findByTagId: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByTagId: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('ReorderPlaylist use case', () => {
  it('should save playlist with new song order', async () => {
    const songs = [buildSong('song-1'), buildSong('song-2'), buildSong('song-3')];
    const songRepository = buildMockSongRepository(songs);
    const savedPlaylist: IPlaylist = { tagId: 'tag-id', songIds: ['song-3', 'song-1', 'song-2'] };
    const playlistRepository = buildMockPlaylistRepository({
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new ReorderPlaylist(songRepository, playlistRepository);
    const { playlist } = await usecase.execute({
      tagId: 'tag-id',
      songIds: ['song-3', 'song-1', 'song-2'],
    });

    expect(playlistRepository.save).toHaveBeenCalledWith({
      tagId: 'tag-id',
      songIds: ['song-3', 'song-1', 'song-2'],
    });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should throw InvalidPlaylistSongError when a songId does not belong to the tag', async () => {
    const songs = [buildSong('song-1'), buildSong('song-2')];
    const songRepository = buildMockSongRepository(songs);
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new ReorderPlaylist(songRepository, playlistRepository);

    await expect(
      usecase.execute({ tagId: 'tag-id', songIds: ['song-1', 'song-99'] }),
    ).rejects.toThrow(InvalidPlaylistSongError);

    expect(playlistRepository.save).not.toHaveBeenCalled();
  });
});
