import { ReorderPlaylist } from '../../src/application/usecases/ReorderPlaylist';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { InvalidPlaylistSongError, PlaylistNotFoundError } from '../../src/domain/errors/DomainError';

const buildMockPlaylistRepository = (overrides: Partial<IPlaylistRepository> = {}): IPlaylistRepository => ({
  findByName: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByName: jest.fn().mockResolvedValue(undefined),
  removeSongFromAll: jest.fn().mockResolvedValue(undefined),
  rename: jest.fn().mockResolvedValue(null),
  ...overrides,
});

const buildMockMetaRepository = (overrides: Partial<IMetaRepository> = {}): IMetaRepository => ({
  touch: jest.fn().mockResolvedValue(undefined),
  getUpdatedAt: jest.fn().mockResolvedValue(new Date()),
  ...overrides,
});

describe('ReorderPlaylist use case', () => {
  it('should save playlist with new song order', async () => {
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1', 'song-2', 'song-3'] };
    const savedPlaylist: IPlaylist = { name: 'rock', songIds: ['song-3', 'song-1', 'song-2'] };
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new ReorderPlaylist(playlistRepository, buildMockMetaRepository());
    const { playlist } = await usecase.execute({
      playlistName: 'rock',
      songIds: ['song-3', 'song-1', 'song-2'],
    });

    expect(playlistRepository.save).toHaveBeenCalledWith({
      name: 'rock',
      songIds: ['song-3', 'song-1', 'song-2'],
    });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should throw InvalidPlaylistSongError when a songId does not belong to the playlist', async () => {
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1', 'song-2'] };
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
    });

    const usecase = new ReorderPlaylist(playlistRepository, buildMockMetaRepository());

    await expect(
      usecase.execute({ playlistName: 'rock', songIds: ['song-1', 'song-99'] }),
    ).rejects.toThrow(InvalidPlaylistSongError);

    expect(playlistRepository.save).not.toHaveBeenCalled();
  });

  it('should throw PlaylistNotFoundError when the playlist does not exist', async () => {
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
    });

    const usecase = new ReorderPlaylist(playlistRepository, buildMockMetaRepository());

    await expect(
      usecase.execute({ playlistName: 'nonexistent', songIds: [] }),
    ).rejects.toThrow(PlaylistNotFoundError);

    expect(playlistRepository.save).not.toHaveBeenCalled();
  });
});
