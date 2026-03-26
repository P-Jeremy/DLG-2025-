import { RemoveSongFromPlaylist } from '../../src/application/usecases/RemoveSongFromPlaylist';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { ITagRepository } from '../../src/domain/interfaces/ITagRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { ITag } from '../../src/domain/interfaces/Tags';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { TagNotFoundError, SongNotFoundError } from '../../src/domain/errors/DomainError';

const buildSong = (id: string): ISong => ({
  id,
  title: `Song ${id}`,
  author: 'Artist',
  lyrics: '',
  tab: '',
});

const buildTag = (id: string): ITag => ({ id, name: `Tag ${id}` });

const buildMockTagRepository = (overrides: Partial<ITagRepository> = {}): ITagRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByName: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((tag: ITag) => Promise.resolve({ ...tag, id: 'new-id' })),
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
  update: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
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

describe('RemoveSongFromPlaylist use case', () => {
  it('should remove the song from the playlist and clear its tag', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1', 'song-2'] };
    const savedPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-2'] };

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);
    const { playlist } = await usecase.execute({ tagId: 'tag-1', songId: 'song-1' });

    expect(songRepository.removeTagFromSong).toHaveBeenCalledWith('song-1');
    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: ['song-2'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should save an empty playlist when the song was the only entry', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1'] };
    const savedPlaylist: IPlaylist = { tagId: 'tag-1', songIds: [] };

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);
    const { playlist } = await usecase.execute({ tagId: 'tag-1', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: [] });
    expect(playlist.songIds).toHaveLength(0);
  });

  it('should throw TagNotFoundError when the tag does not exist', async () => {
    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(null) });
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);

    await expect(
      usecase.execute({ tagId: 'nonexistent', songId: 'song-1' }),
    ).rejects.toThrow(TagNotFoundError);
    expect(songRepository.removeTagFromSong).not.toHaveBeenCalled();
  });

  it('should throw SongNotFoundError when the song does not exist', async () => {
    const tag = buildTag('tag-1');
    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(null) });
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);

    await expect(
      usecase.execute({ tagId: 'tag-1', songId: 'nonexistent' }),
    ).rejects.toThrow(SongNotFoundError);
    expect(songRepository.removeTagFromSong).not.toHaveBeenCalled();
  });

  it('should save playlist with all original songs when playlist is empty', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-1');

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
    });

    const usecase = new RemoveSongFromPlaylist(tagRepository, songRepository, playlistRepository);
    await usecase.execute({ tagId: 'tag-1', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: [] });
  });
});
