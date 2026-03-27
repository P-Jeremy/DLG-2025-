import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IFileUploadService, UploadableFile } from '../interfaces/IFileUploadService';
import type { IEventEmitter } from '../interfaces/IEventEmitter';
import type { ISong } from '../../domain/interfaces/Song';
import { SongNotFoundError } from '../../domain/errors/DomainError';

const SONG_UPDATED_EVENT = 'refresh';

export interface UpdateSongInput {
  songId: string;
  title: string;
  author: string;
  lyrics: string;
  tabFile?: UploadableFile;
}

export interface UpdateSongOutput {
  song: ISong;
}

export class UpdateSong {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly fileUploadService: IFileUploadService,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: UpdateSongInput): Promise<UpdateSongOutput> {
    const existingSong = await this.songRepository.findById(input.songId);
    if (!existingSong) throw new SongNotFoundError();

    let tabUrl = existingSong.tab;

    if (input.tabFile) {
      tabUrl = await this.fileUploadService.upload(input.tabFile);
      await this.fileUploadService.delete(existingSong.tab);
    }

    const updatedSongData: ISong = {
      id: input.songId,
      title: input.title,
      author: input.author,
      lyrics: input.lyrics,
      tab: tabUrl,
    };

    const savedSong = await this.songRepository.update(updatedSongData);

    this.eventEmitter.emit(SONG_UPDATED_EVENT);

    return { song: savedSong };
  }
}
