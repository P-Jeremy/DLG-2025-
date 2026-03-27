import { UpdateSong } from '../../src/application/usecases/UpdateSong';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IFileUploadService, UploadableFile } from '../../src/application/interfaces/IFileUploadService';
import type { IEventEmitter } from '../../src/application/interfaces/IEventEmitter';
import type { ISong } from '../../src/domain/interfaces/Song';
import { SongNotFoundError } from '../../src/domain/errors/DomainError';

const buildSong = (overrides: Partial<ISong> = {}): ISong => ({
  id: 'song-1',
  title: 'Original Title',
  author: 'Original Artist',
  lyrics: '<p>Original lyrics</p>',
  tab: 'https://bucket.s3.amazonaws.com/original.png',
  ...overrides,
});

const buildMockFile = (overrides: Partial<UploadableFile> = {}): UploadableFile => ({
  originalname: 'new-tab.png',
  mimetype: 'image/png',
  buffer: Buffer.from('fake-image'),
  size: 1024,
  ...overrides,
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

const buildMockFileUploadService = (overrides: Partial<IFileUploadService> = {}): IFileUploadService => ({
  upload: jest.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/new-uuid.png'),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockEventEmitter = (overrides: Partial<IEventEmitter> = {}): IEventEmitter => ({
  emit: jest.fn(),
  ...overrides,
});

describe('UpdateSong use case', () => {
  it('throws SongNotFoundError when the song does not exist', async () => {
    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(null),
    });

    const usecase = new UpdateSong(songRepository, buildMockFileUploadService(), buildMockEventEmitter());

    await expect(
      usecase.execute({ songId: 'nonexistent', title: 'T', author: 'A', lyrics: 'L' }),
    ).rejects.toThrow(SongNotFoundError);

    expect(songRepository.update).not.toHaveBeenCalled();
  });

  it('updates song fields without uploading a new file when tabFile is not provided', async () => {
    const existingSong = buildSong();
    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(existingSong),
    });
    const fileUploadService = buildMockFileUploadService();

    const usecase = new UpdateSong(songRepository, fileUploadService, buildMockEventEmitter());

    await usecase.execute({
      songId: 'song-1',
      title: 'Updated Title',
      author: 'Updated Artist',
      lyrics: '<p>Updated lyrics</p>',
    });

    expect(fileUploadService.upload).not.toHaveBeenCalled();
    expect(fileUploadService.delete).not.toHaveBeenCalled();
    expect(songRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'song-1',
        title: 'Updated Title',
        author: 'Updated Artist',
        lyrics: '<p>Updated lyrics</p>',
        tab: existingSong.tab,
      }),
    );
  });

  it('uploads new file, deletes old S3 file, and saves updated song when tabFile is provided', async () => {
    const oldTabUrl = 'https://bucket.s3.amazonaws.com/original.png';
    const newTabUrl = 'https://bucket.s3.amazonaws.com/new-uuid.png';
    const existingSong = buildSong({ tab: oldTabUrl });
    const newFile = buildMockFile();

    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(existingSong),
    });
    const fileUploadService = buildMockFileUploadService({
      upload: jest.fn().mockResolvedValue(newTabUrl),
    });

    const usecase = new UpdateSong(songRepository, fileUploadService, buildMockEventEmitter());

    await usecase.execute({
      songId: 'song-1',
      title: 'Updated Title',
      author: 'Updated Artist',
      lyrics: '<p>lyrics</p>',
      tabFile: newFile,
    });

    expect(fileUploadService.upload).toHaveBeenCalledWith(newFile);
    expect(fileUploadService.delete).toHaveBeenCalledWith(oldTabUrl);
    expect(songRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ tab: newTabUrl }),
    );
  });

  it('emits the refresh event after saving the updated song', async () => {
    const eventEmitter = buildMockEventEmitter();
    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(buildSong()),
    });

    const usecase = new UpdateSong(songRepository, buildMockFileUploadService(), eventEmitter);

    await usecase.execute({ songId: 'song-1', title: 'T', author: 'A', lyrics: 'L' });

    expect(eventEmitter.emit).toHaveBeenCalledWith('refresh');
  });

  it('returns the updated song', async () => {
    const updatedSong: ISong = {
      id: 'song-1',
      title: 'Updated Title',
      author: 'Updated Artist',
      lyrics: '<p>Updated lyrics</p>',
      tab: 'https://bucket.s3.amazonaws.com/original.png',
    };

    const songRepository = buildMockSongRepository({
      findById: jest.fn().mockResolvedValue(buildSong()),
      update: jest.fn().mockResolvedValue(updatedSong),
    });

    const usecase = new UpdateSong(songRepository, buildMockFileUploadService(), buildMockEventEmitter());

    const { song } = await usecase.execute({
      songId: 'song-1',
      title: 'Updated Title',
      author: 'Updated Artist',
      lyrics: '<p>Updated lyrics</p>',
    });

    expect(song).toEqual(updatedSong);
  });
});
