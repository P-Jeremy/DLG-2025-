import { RemoveSongFromPlaylist } from '../../src/application/usecases/RemoveSongFromPlaylist';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { PlaylistNotFoundError, SongNotFoundError } from '../../src/domain/errors/DomainError';
import type { IEventEmitter } from '../../src/application/interfaces/IEventEmitter';

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

const buildMockEventEmitter = (): IEventEmitter => ({
  emit: jest.fn(),
});

describe('RemoveSongFromPlaylist use case', () => {
  it('should remove the song from the playlist', async () => {
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1', 'song-2'] };
    const savedPlaylist: IPlaylist = { name: 'rock', songIds: ['song-2'] };

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new RemoveSongFromPlaylist(songRepository, playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());
    const { playlist } = await usecase.execute({ playlistName: 'rock', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: ['song-2'] });
    expect(playlist).toEqual(savedPlaylist);
  });

  it('should save an empty playlist when the song was the only entry', async () => {
    const song = buildSong('song-1');
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1'] };
    const savedPlaylist: IPlaylist = { name: 'rock', songIds: [] };

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
      save: jest.fn().mockResolvedValue(savedPlaylist),
    });

    const usecase = new RemoveSongFromPlaylist(songRepository, playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());
    const { playlist } = await usecase.execute({ playlistName: 'rock', songId: 'song-1' });

    expect(playlistRepository.save).toHaveBeenCalledWith({ name: 'rock', songIds: [] });
    expect(playlist.songIds).toHaveLength(0);
  });

  it('should throw PlaylistNotFoundError when the playlist does not exist', async () => {
    const songRepository = buildMockSongRepository();
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(null),
    });

    const usecase = new RemoveSongFromPlaylist(songRepository, playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());

    await expect(
      usecase.execute({ playlistName: 'nonexistent', songId: 'song-1' }),
    ).rejects.toThrow(PlaylistNotFoundError);
    expect(playlistRepository.save).not.toHaveBeenCalled();
  });

  it('should throw SongNotFoundError when the song does not exist', async () => {
    const existingPlaylist: IPlaylist = { name: 'rock', songIds: ['song-1'] };
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(null) });
    const playlistRepository = buildMockPlaylistRepository({
      findByName: jest.fn().mockResolvedValue(existingPlaylist),
    });

    const usecase = new RemoveSongFromPlaylist(songRepository, playlistRepository, buildMockMetaRepository(), buildMockEventEmitter());

    await expect(
      usecase.execute({ playlistName: 'rock', songId: 'nonexistent' }),
    ).rejects.toThrow(SongNotFoundError);
    expect(playlistRepository.save).not.toHaveBeenCalled();
  });
});
