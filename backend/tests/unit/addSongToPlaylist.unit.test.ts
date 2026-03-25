import { AddSongToPlaylist } from '../../src/application/usecases/AddSongToPlaylist';
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
  setTag: jest.fn().mockResolvedValue(undefined),
  save: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  ...overrides,
});

const buildMockPlaylistRepository = (overrides: Partial<IPlaylistRepository> = {}): IPlaylistRepository => ({
  findByTagId: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((pl: IPlaylist) => Promise.resolve(pl)),
  deleteByTagId: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('AddSongToPlaylist use case', () => {
  it('should add a song to an empty playlist and assign the tag', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-1');
    const savedPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1'] };

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);
    const { playlist } = await usecase.execute({ tagId: 'tag-1', songId: 'song-1' });

    expect(songRepository.setTag).toHaveBeenCalledWith('song-1', 'tag-1');
    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: ['song-1'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should append the song to an existing playlist', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-2');
    const existingPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1'] };
    const savedPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1', 'song-2'] };

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);
    const { playlist } = await usecase.execute({ tagId: 'tag-1', songId: 'song-2' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: ['song-1', 'song-2'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should not duplicate a song already in the playlist', async () => {
    const tag = buildTag('tag-1');
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { tagId: 'tag-1', songIds: ['song-1'] };

    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByTagId: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(existingPlaylist),
    });

    const usecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);
    await usecase.execute({ tagId: 'tag-1', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ tagId: 'tag-1', songIds: ['song-1'] });
  });

  it('should throw TagNotFoundError when the tag does not exist', async () => {
    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(null) });
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);

    await expect(usecase.execute({ tagId: 'nonexistent', songId: 'song-1' })).rejects.toThrow(TagNotFoundError);
    expect(songRepository.setTag).not.toHaveBeenCalled();
  });

  it('should throw SongNotFoundError when the song does not exist', async () => {
    const tag = buildTag('tag-1');
    const tagRepository = buildMockTagRepository({ findById: jest.fn().mockResolvedValue(tag) });
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(null) });
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new AddSongToPlaylist(tagRepository, songRepository, playlistRepository);

    await expect(usecase.execute({ tagId: 'tag-1', songId: 'nonexistent' })).rejects.toThrow(SongNotFoundError);
    expect(songRepository.setTag).not.toHaveBeenCalled();
  });
});
