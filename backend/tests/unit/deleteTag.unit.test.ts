import { DeleteTag } from '../../src/application/usecases/DeleteTag';
import type { ITagRepository } from '../../src/domain/interfaces/ITagRepository';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { ITag } from '../../src/domain/interfaces/Tags';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { TagNotFoundError } from '../../src/domain/errors/DomainError';

const buildMockTagRepository = (overrides: Partial<ITagRepository> = {}): ITagRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByName: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((tag: ITag) => Promise.resolve(tag)),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockSongRepository = (overrides: Partial<ISongRepository> = {}): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findByTagId: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  removeTagFromAll: jest.fn().mockResolvedValue(undefined),
  removeTagFromSong: jest.fn().mockResolvedValue(undefined),
  setTag: jest.fn().mockResolvedValue(undefined),
  save: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  deleteById: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockPlaylistRepository = (overrides: Partial<IPlaylistRepository> = {}): IPlaylistRepository => ({
  findByTagId: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByTagId: jest.fn().mockResolvedValue(undefined),
  removeSongFromAll: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('DeleteTag use case', () => {
  it('should remove tag from all songs and delete the tag', async () => {
    const tag: ITag = { id: 'tag-id', name: 'rock' };
    const tagRepository = buildMockTagRepository({
      findById: jest.fn().mockResolvedValue(tag),
    });
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new DeleteTag(tagRepository, songRepository, playlistRepository);
    await usecase.execute({ tagId: 'tag-id' });

    expect(songRepository.removeTagFromAll).toHaveBeenCalledWith('tag-id');
    expect(tagRepository.delete).toHaveBeenCalledWith('tag-id');
  });

  it('should delete the playlist for the tag', async () => {
    const tag: ITag = { id: 'tag-id', name: 'rock' };
    const tagRepository = buildMockTagRepository({
      findById: jest.fn().mockResolvedValue(tag),
    });
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new DeleteTag(tagRepository, songRepository, playlistRepository);
    await usecase.execute({ tagId: 'tag-id' });

    expect(playlistRepository.deleteByTagId).toHaveBeenCalledWith('tag-id');
  });

  it('should throw TagNotFoundError when tag does not exist', async () => {
    const tagRepository = buildMockTagRepository({
      findById: jest.fn().mockResolvedValue(null),
    });
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new DeleteTag(tagRepository, songRepository, playlistRepository);

    await expect(usecase.execute({ tagId: 'nonexistent-id' })).rejects.toThrow(TagNotFoundError);
    expect(songRepository.removeTagFromAll).not.toHaveBeenCalled();
    expect(tagRepository.delete).not.toHaveBeenCalled();
  });
});
