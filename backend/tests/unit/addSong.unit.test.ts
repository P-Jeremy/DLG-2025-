import { AddSong } from '../../src/application/usecases/AddSong';
import type { ISongRepository } from '../../src/domain/interfaces/ISongRepository';
import type { IUserRepository } from '../../src/domain/interfaces/IUserRepository';
import type { IEmailService } from '../../src/domain/interfaces/IEmailService';
import type { IFileUploadService, UploadableFile } from '../../src/application/interfaces/IFileUploadService';
import type { IEventEmitter } from '../../src/application/interfaces/IEventEmitter';
import type { ISong } from '../../src/domain/interfaces/Song';
import { User } from '../../src/domain/models/User';
import { Email } from '../../src/domain/value-objects/Email';
import { Pseudo } from '../../src/domain/value-objects/Pseudo';
import { HashedPassword } from '../../src/domain/value-objects/HashedPassword';

const buildMockFile = (overrides: Partial<UploadableFile> = {}): UploadableFile => ({
  originalname: 'tab.png',
  mimetype: 'image/png',
  buffer: Buffer.from('fake-image'),
  size: 1024,
  ...overrides,
});

const buildMockSongRepository = (overrides: Partial<ISongRepository> = {}): ISongRepository => ({
  getAll: jest.fn().mockResolvedValue([]),
  findByTagId: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  removeTagFromAll: jest.fn().mockResolvedValue(undefined),
  removeTagFromSong: jest.fn().mockResolvedValue(undefined),
  setTag: jest.fn().mockResolvedValue(undefined),
  save: jest.fn().mockImplementation((song: ISong) =>
    Promise.resolve({ ...song, id: 'saved-song-id' }),
  ),
  update: jest.fn().mockImplementation((song: ISong) => Promise.resolve(song)),
  deleteById: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildMockUserRepository = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findByEmail: jest.fn().mockResolvedValue(null),
  findByPseudo: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByResetToken: jest.fn().mockResolvedValue(null),
  findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
  update: jest.fn(),
  ...overrides,
});

const buildMockEmailService = (overrides: Partial<IEmailService> = {}): IEmailService => ({
  sendActivationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendNewSongNotification: jest.fn().mockResolvedValue(undefined),
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

const buildUserWithTitleNotif = (email: string): User =>
  new User({
    id: 'user-id',
    email: new Email(email),
    pseudo: new Pseudo('john'),
    password: new HashedPassword('hashed'),
    isAdmin: false,
    isActive: true,
    isDeleted: false,
    titleNotif: true,
    tokens: [],
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
      buildMockUserRepository(),
      buildMockEmailService(),
      fileUploadService,
      buildMockEventEmitter(),
    );

    const file = buildMockFile();
    await usecase.execute({ title: 'My Song', author: 'Artist', lyrics: '<p>lyrics</p>', tabFile: file, tagIds: [] });

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
      tags: [],
    };
    const songRepository = buildMockSongRepository({
      save: jest.fn().mockResolvedValue(savedSong),
    });

    const usecase = new AddSong(
      songRepository,
      buildMockUserRepository(),
      buildMockEmailService(),
      buildMockFileUploadService(),
      buildMockEventEmitter(),
    );

    const { song } = await usecase.execute({
      title: 'My Song',
      author: 'Artist',
      lyrics: '<p>lyrics</p>',
      tabFile: buildMockFile(),
      tagIds: [],
    });

    expect(song).toEqual(savedSong);
  });

  it('should send notification emails to all users with titleNotif enabled', async () => {
    const userOne = buildUserWithTitleNotif('user1@example.com');
    const userTwo = buildUserWithTitleNotif('user2@example.com');
    const userRepository = buildMockUserRepository({
      findAllWithTitleNotif: jest.fn().mockResolvedValue([userOne, userTwo]),
    });
    const emailService = buildMockEmailService();
    const savedSong: ISong = {
      id: 'saved-id',
      title: 'New Song',
      author: 'Artist',
      lyrics: '',
      tab: 'https://url',
      tags: [],
    };
    const songRepository = buildMockSongRepository({
      save: jest.fn().mockResolvedValue(savedSong),
    });

    const usecase = new AddSong(songRepository, userRepository, emailService, buildMockFileUploadService(), buildMockEventEmitter());

    await usecase.execute({
      title: 'New Song',
      author: 'Artist',
      lyrics: '',
      tabFile: buildMockFile(),
      tagIds: [],
    });

    expect(emailService.sendNewSongNotification).toHaveBeenCalledTimes(2);
    expect(emailService.sendNewSongNotification).toHaveBeenCalledWith('user1@example.com', 'New Song');
    expect(emailService.sendNewSongNotification).toHaveBeenCalledWith('user2@example.com', 'New Song');
  });

  it('should still save the song even if no users need to be notified', async () => {
    const userRepository = buildMockUserRepository({
      findAllWithTitleNotif: jest.fn().mockResolvedValue([]),
    });
    const emailService = buildMockEmailService();
    const songRepository = buildMockSongRepository();

    const usecase = new AddSong(songRepository, userRepository, emailService, buildMockFileUploadService(), buildMockEventEmitter());

    await usecase.execute({
      title: 'Silent Song',
      author: 'Artist',
      lyrics: '',
      tabFile: buildMockFile(),
      tagIds: [],
    });

    expect(songRepository.save).toHaveBeenCalled();
    expect(emailService.sendNewSongNotification).not.toHaveBeenCalled();
  });

  it('should pass tagIds to the repository as tag objects', async () => {
    const songRepository = buildMockSongRepository();

    const usecase = new AddSong(
      songRepository,
      buildMockUserRepository(),
      buildMockEmailService(),
      buildMockFileUploadService(),
      buildMockEventEmitter(),
    );

    await usecase.execute({
      title: 'Tagged Song',
      author: 'Artist',
      lyrics: '',
      tabFile: buildMockFile(),
      tagIds: ['tag-id-1', 'tag-id-2'],
    });

    expect(songRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: [
          { id: 'tag-id-1', name: '' },
          { id: 'tag-id-2', name: '' },
        ],
      }),
    );
  });

  it('should not throw if an email notification fails', async () => {
    const userWithNotif = buildUserWithTitleNotif('user@example.com');
    const userRepository = buildMockUserRepository({
      findAllWithTitleNotif: jest.fn().mockResolvedValue([userWithNotif]),
    });
    const emailService = buildMockEmailService({
      sendNewSongNotification: jest.fn().mockRejectedValue(new Error('SMTP failure')),
    });
    const songRepository = buildMockSongRepository();

    const usecase = new AddSong(songRepository, userRepository, emailService, buildMockFileUploadService(), buildMockEventEmitter());

    await expect(
      usecase.execute({ title: 'Song', author: 'Artist', lyrics: '', tabFile: buildMockFile(), tagIds: [] }),
    ).resolves.not.toThrow();
  });

  it('should emit the refresh event after saving the song', async () => {
    const eventEmitter = buildMockEventEmitter();
    const usecase = new AddSong(
      buildMockSongRepository(),
      buildMockUserRepository(),
      buildMockEmailService(),
      buildMockFileUploadService(),
      eventEmitter,
    );

    await usecase.execute({ title: 'Song', author: 'Artist', lyrics: '', tabFile: buildMockFile(), tagIds: [] });

    expect(eventEmitter.emit).toHaveBeenCalledWith('refresh');
  });
});
