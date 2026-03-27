import { RenamePlaylist } from '../../src/application/usecases/RenamePlaylist';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { DuplicatePlaylistError, PlaylistNotFoundError } from '../../src/domain/errors/DomainError';

const buildMockPlaylistRepository = (overrides: Partial<IPlaylistRepository> = {}): IPlaylistRepository => ({
  findByName: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByName: jest.fn().mockResolvedValue(undefined),
  removeSongFromAll: jest.fn().mockResolvedValue(undefined),
  rename: jest.fn().mockResolvedValue(null),
  ...overrides,
});

describe('RenamePlaylist use case', () => {
  it('should rename an existing playlist to a new unique name', async () => {
    const existingPlaylist: IPlaylist = { id: 'pl-1', name: 'rock', songIds: ['song-1'] };
    const renamedPlaylist: IPlaylist = { id: 'pl-1', name: 'hard-rock', songIds: ['song-1'] };

    const findByName = jest.fn()
      .mockResolvedValueOnce(existingPlaylist)
      .mockResolvedValueOnce(null);

    const playlistRepository = buildMockPlaylistRepository({
      findByName,
      rename: jest.fn().mockResolvedValue(renamedPlaylist),
    });

    const usecase = new RenamePlaylist(playlistRepository);
    const { playlist } = await usecase.execute({ name: 'rock', newName: 'hard-rock' });

    expect(playlistRepository.rename).toHaveBeenCalledWith('rock', 'hard-rock');
    expect(playlist).toEqual(renamedPlaylist);
  });

  it('should throw PlaylistNotFoundError when the source playlist does not exist', async () => {
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
    });

    const usecase = new RenamePlaylist(playlistRepository);

    await expect(usecase.execute({ name: 'nonexistent', newName: 'new-name' })).rejects.toThrow(PlaylistNotFoundError);
    expect(playlistRepository.rename).not.toHaveBeenCalled();
  });

  it('should throw DuplicatePlaylistError when the new name is already taken', async () => {
    const existingPlaylist: IPlaylist = { id: 'pl-1', name: 'rock', songIds: [] };
    const conflictPlaylist: IPlaylist = { id: 'pl-2', name: 'pop', songIds: [] };

    const findByName = jest.fn()
      .mockResolvedValueOnce(existingPlaylist)
      .mockResolvedValueOnce(conflictPlaylist);

    const playlistRepository = buildMockPlaylistRepository({
      findByName,
    });

    const usecase = new RenamePlaylist(playlistRepository);

    await expect(usecase.execute({ name: 'rock', newName: 'pop' })).rejects.toThrow(DuplicatePlaylistError);
    expect(playlistRepository.rename).not.toHaveBeenCalled();
  });
});
