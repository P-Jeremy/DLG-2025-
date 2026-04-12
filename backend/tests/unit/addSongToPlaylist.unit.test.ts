import { AddSongToPlaylist } from '../../src/application/usecases/AddSongToPlaylist';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { SongNotFoundError } from '../../src/domain/errors/DomainError';

const buildSong = (id: string): ISong => ({
  id,
  title: `Song ${id}`,
  author: 'Artist',
  lyrics: '',
  tab: '',
});

const buildMockSongRepository = (overrides: Partial<ISongRepository> = {}): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByIds: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  update: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  deleteById: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

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

describe('AddSongToPlaylist use case', () => {
  it('should add a song to an empty playlist when playlist does not exist', async () => {
    const song = buildSong('song-1');
    const savedPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1'] };

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new AddSongToPlaylist(songRepository, playlistRepository, buildMockMetaRepository());
    const { playlist } = await usecase.execute({ playlistName: 'rock', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: ['song-1'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should append the song to an existing playlist', async () => {
    const song = buildSong('song-2');
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1'] };
    const savedPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1', 'song-2'] };

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new AddSongToPlaylist(songRepository, playlistRepository, buildMockMetaRepository());
    const { playlist } = await usecase.execute({ playlistName: 'rock', songId: 'song-2' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: ['song-1', 'song-2'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should not duplicate a song already in the playlist', async () => {
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1'] };

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(existingPlaylist),
    });

    const usecase = new AddSongToPlaylist(songRepository, playlistRepository, buildMockMetaRepository());
    await usecase.execute({ playlistName: 'rock', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: ['song-1'] });
  });

  it('should throw SongNotFoundError when the song does not exist', async () => {
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(null) });
    const playlistRepository = buildMockPlaylistRepository();

    const usecase = new AddSongToPlaylist(songRepository, playlistRepository, buildMockMetaRepository());

    await expect(usecase.execute({ playlistName: 'rock', songId: 'nonexistent' })).rejects.toThrow(SongNotFoundError);
    expect(playlistRepository.save).not.toHaveBeenCalled();
  });
});
