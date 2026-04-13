import { DeletePlaylist } from '../../src/application/usecases/DeletePlaylist';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { PlaylistNotFoundError } from '../../src/domain/errors/DomainError';
import type { IEventEmitter } from '../../src/application/interfaces/IEventEmitter';

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

const buildMockEventEmitter = (): IEventEmitter => ({
  emit: jest.fn(),
});

describe('DeletePlaylist use case', () => {
  it('should delete an existing playlist', async () => {
    const existingPlaylist: IPlaylist = { id: 'pl-1', name: 'rock', songIds: [] };
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      deleteByName: jest.fn().mockResolvedValue(undefined),
    });

    const usecase = new DeletePlaylist(playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());
    await usecase.execute({ name: 'rock' });

    expect(playlistRepository.deleteByName).toHaveBeenCalledWith('rock');
  });

  it('should throw PlaylistNotFoundError when the playlist does not exist', async () => {
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
    });

    const usecase = new DeletePlaylist(playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());

    await expect(usecase.execute({ name: 'nonexistent' })).rejects.toThrow(PlaylistNotFoundError);
    expect(playlistRepository.deleteByName).not.toHaveBeenCalled();
  });
});
