import { DeleteSong } from '../../src/application/usecases/DeleteSong';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../src/domain/interfaces/IPlaylistRepository';
import type { IFileUploadService } from '../../src/application/interfaces/IFileUploadService';
import type { ISong } from '../../src/domain/interfaces/Song';
import type { IPlaylist } from '../../src/domain/interfaces/IPlaylist';
import { SongNotFoundError } from '../../src/domain/errors/DomainError';

const buildSong = (id: string, tab = ''): ISong => ({
  id,
  title: `Song ${id}`,
  author: 'Artist',
  lyrics: '',
  tab,
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

const buildMockFileUploadService = (overrides: Partial<IFileUploadService> = {}): IFileUploadService => ({
  upload: jest.fn().mockResolvedValue('https://example.com/file.jpg'),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('DeleteSong use case', () => {
  it('should delete the song, remove it from all playlists, and delete its S3 image', async () => {
    const song = buildSong('song-1', 'https://bucket.s3.amazonaws.com/image.jpg');

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository();
    const fileUploadService = buildMockFileUploadService();

    const usecase = new DeleteSong(songRepository, playlistRepository, fileUploadService);
    await usecase.execute({ songId: 'song-1' });

    expect(fileUploadService.delete).toHaveBeenCalledWith('https://bucket.s3.amazonaws.com/image.jpg');
    expect(playlistRepository.removeSongFromAll).toHaveBeenCalledWith('song-1');
    expect(songRepository.deleteById).toHaveBeenCalledWith('song-1');
  });

  it('should delete the song without calling file delete when no tab url is set', async () => {
    const song = buildSong('song-1', '');

    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(song) });
    const playlistRepository = buildMockPlaylistRepository();
    const fileUploadService = buildMockFileUploadService();

    const usecase = new DeleteSong(songRepository, playlistRepository, fileUploadService);
    await usecase.execute({ songId: 'song-1' });

    expect(fileUploadService.delete).not.toHaveBeenCalled();
    expect(playlistRepository.removeSongFromAll).toHaveBeenCalledWith('song-1');
    expect(songRepository.deleteById).toHaveBeenCalledWith('song-1');
  });

  it('should throw SongNotFoundError when the song does not exist', async () => {
    const songRepository = buildMockSongRepository({ findById: jest.fn().mockResolvedValue(null) });
    const playlistRepository = buildMockPlaylistRepository();
    const fileUploadService = buildMockFileUploadService();

    const usecase = new DeleteSong(songRepository, playlistRepository, fileUploadService);

    await expect(usecase.execute({ songId: 'nonexistent' })).rejects.toThrow(SongNotFoundError);
    expect(playlistRepository.removeSongFromAll).not.toHaveBeenCalled();
    expect(songRepository.deleteById).not.toHaveBeenCalled();
    expect(fileUploadService.delete).not.toHaveBeenCalled();
  });

  it('should remove the song from all playlists before deleting from the repository', async () => {
    const callOrder: string[] = [];
    const song = buildSong('song-1', 'https://bucket.s3.amazonaws.com/image.jpg');

    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(song),
      deleteById: jest.fn().mockImplementation(() => {
        callOrder.push('deleteById');
        return Promise.resolve();
      }),
    });
    const playlistRepository = buildMockPlaylistRepository({
      removeSongFromAll: jest.fn().mockImplementation(() => {
        callOrder.push('removeSongFromAll');
        return Promise.resolve();
      }),
    });
    const fileUploadService = buildMockFileUploadService();

    const usecase = new DeleteSong(songRepository, playlistRepository, fileUploadService);
    await usecase.execute({ songId: 'song-1' });

    expect(callOrder).toEqual(['removeSongFromAll', 'deleteById']);
  });
});
