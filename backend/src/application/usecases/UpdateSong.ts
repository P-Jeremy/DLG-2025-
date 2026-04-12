import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IFileUploadService, UploadableFile } from '../interfaces/IFileUploadService';
import type { IEventEmitter } from '../interfaces/IEventEmitter';
import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';
import type { ISong } from '../../domain/interfaces/Song';
import { SongNotFoundError } from '../../domain/errors/DomainError';
import { SONG_EVENTS } from '../constants/events';

const SONG_UPDATED_EVENT = SONG_EVENTS.REFRESH;

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
    private readonly metaRepository: IMetaRepository,
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

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_UPDATED_EVENT);

    return { song: savedSong };
  }
}
