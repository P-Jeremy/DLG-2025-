import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IFileUploadService } from '../interfaces/IFileUploadService';
import type { IEventEmitter } from '../interfaces/IEventEmitter';
import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';
import { SongNotFoundError } from '../../domain/errors/DomainError';
import { SONG_EVENTS } from '../constants/events';

export interface DeleteSongInput {
  songId: string;
}

export class DeleteSong {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
    private readonly fileUploadService: IFileUploadService,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: DeleteSongInput): Promise<void> {
    const song = await this.songRepository.findById(input.songId);
    if (!song) throw new SongNotFoundError();

    if (song.tab) {
      await this.fileUploadService.delete(song.tab);
    }

    await this.playlistRepository.removeSongFromAll(input.songId);
    await this.songRepository.deleteById(input.songId);

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);
  }
}
