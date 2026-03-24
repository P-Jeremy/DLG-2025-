import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IUserRepository } from '../../domain/interfaces/IUserRepository';
import type { IEmailService } from '../../domain/interfaces/IEmailService';
import type { IFileUploadService, UploadableFile } from '../interfaces/IFileUploadService';
import type { ISong } from '../../domain/interfaces/Song';

export interface AddSongInput {
  title: string;
  author: string;
  lyrics: string;
  tabFile: UploadableFile;
  tagIds: string[];
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
  ) {}

  async execute(input: AddSongInput): Promise<AddSongOutput> {
    const tabUrl = await this.fileUploadService.upload(input.tabFile);

    const songData: ISong = {
      title: input.title,
      author: input.author,
      lyrics: input.lyrics,
      tab: tabUrl,
      tags: input.tagIds.map((id) => ({ id, name: '' })),
    };

    const savedSong = await this.songRepository.save(songData);

    const usersToNotify = await this.userRepository.findAllWithTitleNotif();
    await Promise.allSettled(
      usersToNotify.map((user) =>
        this.emailService.sendNewSongNotification(user.email.toString(), savedSong.title),
      ),
    );

    return { song: savedSong };
  }
}
