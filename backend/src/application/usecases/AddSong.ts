import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IEmailService } from '../../domain/interfaces/IEmailService';
import type { IFileUploadService, UploadableFile } from '../interfaces/IFileUploadService';
import type { IEventEmitter } from '../interfaces/IEventEmitter';
import type { ISong } from '../../domain/interfaces/Song';

const SONG_ADDED_EVENT = 'refresh';

export interface AddSongInput {
  title: string;
  author: string;
  lyrics: string;
  tabFile: UploadableFile;
}

export interface AddSongOutput {
  song: ISong;
}

export class AddSong {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly fileUploadService: IFileUploadService,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: AddSongInput): Promise<AddSongOutput> {
    const tabUrl = await this.fileUploadService.upload(input.tabFile);

    const songData: ISong = {
      title: input.title,
      author: input.author,
      lyrics: input.lyrics,
      tab: tabUrl,
    };

    const savedSong = await this.songRepository.save(songData);

    const usersToNotify = await this.userRepository.findAllWithTitleNotif();
    await Promise.allSettled(
      usersToNotify.map((user) =>
        this.emailService.sendNewSongNotification(user.email.toString(), savedSong.title),
      ),
    );

    this.eventEmitter.emit(SONG_ADDED_EVENT);

    return { song: savedSong };
  }
}
