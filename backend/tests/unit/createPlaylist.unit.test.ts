import { CreatePlaylist } from '../../src/application/usecases/CreatePlaylist';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { DuplicatePlaylistError } from '../../src/domain/errors/DomainError';
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

describe('CreatePlaylist use case', () => {
  it('should create a new playlist with empty songIds', async () => {
    const savedPlaylist: IPlaylist = { id: 'pl-1', name: 'rock', songIds: [] };
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new CreatePlaylist(playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());
    const { playlist } = await usecase.execute({ name: 'rock' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: [] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should throw DuplicatePlaylistError when a playlist with the same name already exists', async () => {
    const existingPlaylist: IPlaylist = { id: 'pl-1', name: 'rock', songIds: [] };
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
    });

    const usecase = new CreatePlaylist(playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());

    await expect(usecase.execute({ name: 'rock' })).rejects.toThrow(DuplicatePlaylistError);
    expect(playlistRepository.save).not.toHaveBeenCalled();
  });
});
