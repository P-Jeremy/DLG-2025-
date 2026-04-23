import { AddSong } from '../../src/application/usecases/AddSong';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IFileUploadService, UploadableFile } from '../../src/application/interfaces/IFileUploadService';
import type { IEventEmitter } from '../../src/application/interfaces/IEventEmitter';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';
import type { ISong } from '../../src/domain/interfaces/Song';

const buildMockFile = (overrides: Partial<UploadableFile> = {}): UploadableFile => ({
  originalname: 'tab.png',
  mimetype: 'image/png',
  buffer: Buffer.from('fake-image'),
  size: 1024,
  ...overrides,
});

const buildMockSongRepository = (overrides: Partial<ISongRepository> = {}): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByIds: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockImplementation((song: ISong) =>
    Promise.resolve({ ...song, id: 'saved-song-id' }),
  ),
  update: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  deleteById: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockFileUploadService = (overrides: Partial<IFileUploadService> = {}): IFileUploadService => ({
  upload: jest.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/uuid.png'),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockEventEmitter = (overrides: Partial<IEventEmitter> = {}): IEventEmitter => ({
  emit: jest.fn(),
  ...overrides,
});

const buildMockMetaRepository = (overrides: Partial<IMetaRepository> = {}): IMetaRepository => ({
  touch: jest.fn().mockResolvedValue(undefined),
  getUpdatedAt: jest.fn().mockResolvedValue(new Date()),
  ...overrides,
});

describe('AddSong use case', () => {
  it('should upload the tab file and save the song with the returned URL', async () => {
    const tabUrl = 'https://bucket.s3.amazonaws.com/uuid.png';
    const fileUploadService = buildMockFileUploadService({
      upload: jest.fn().mockResolvedValue(tabUrl),
    });
    const songRepository = buildMockSongRepository();

    const usecase = new AddSong(
      songRepository,
      fileUploadService,
      buildMockEventEmitter(),
      buildMockMetaRepository(),
    );

    const file = buildMockFile();
    await usecase.execute({ title: 'My Song', author: 'Artist', lyrics: '<p>lyrics</p>', tabFile: file });

    expect(fileUploadService.upload).toHaveBeenCalledWith(file);
    expect(songRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ tab: tabUrl }),
    );
  });

  it('should return the saved song', async () => {
    const savedSong: ISong = {
      id: 'saved-id',
      title: 'My Song',
      author: 'Artist',
      lyrics: '<p>lyrics</p>',
      tab: 'https://bucket.s3.amazonaws.com/uuid.png',
    };
    const songRepository = buildMockSongRepository({
      save: jest.fn().mockResolvedValue(savedSong),
    });

    const usecase = new AddSong(
      songRepository,
      buildMockFileUploadService(),
      buildMockEventEmitter(),
      buildMockMetaRepository(),
    );

    const { song } = await usecase.execute({
      title: 'My Song',
      author: 'Artist',
      lyrics: '<p>lyrics</p>',
      tabFile: buildMockFile(),
    });

    expect(song).toEqual(savedSong);
  });

  it('should touch meta repository after saving', async () => {
    const metaRepository = buildMockMetaRepository();
    const usecase = new AddSong(
      buildMockSongRepository(),
      buildMockFileUploadService(),
      buildMockEventEmitter(),
      metaRepository,
    );

    await usecase.execute({ title: 'Song', author: 'Artist', lyrics: '', tabFile: buildMockFile() });

    expect(metaRepository.touch).toHaveBeenCalled();
  });

  it('should emit the refresh event after saving the song', async () => {
    const eventEmitter = buildMockEventEmitter();
    const usecase = new AddSong(
      buildMockSongRepository(),
      buildMockFileUploadService(),
      eventEmitter,
      buildMockMetaRepository(),
    );

    await usecase.execute({ title: 'Song', author: 'Artist', lyrics: '', tabFile: buildMockFile() });

    expect(eventEmitter.emit).toHaveBeenCalledWith('refresh');
  });
});
