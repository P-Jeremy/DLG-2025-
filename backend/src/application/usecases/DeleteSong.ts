import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IFileUploadService } from '../interfaces/IFileUploadService';
import { SongNotFoundError } from '../../domain/errors/DomainError';

export interface DeleteSongInput {
  songId: string;
}

export class DeleteSong {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
    private readonly fileUploadService: IFileUploadService,
  ) {}

  async execute(input: DeleteSongInput): Promise<void> {
    const song = await this.songRepository.findById(input.songId);
    if (!song) throw new SongNotFoundError();

    if (song.tab) {
      await this.fileUploadService.delete(song.tab);
    }

    await this.playlistRepository.removeSongFromAll(input.songId);
    await this.songRepository.deleteById(input.songId);
  }
}
