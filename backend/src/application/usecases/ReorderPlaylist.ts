import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import { InvalidPlaylistSongError } from '../../domain/errors/DomainError';

export interface ReorderPlaylistInput {
  tagId: string;
  songIds: string[];
}

export interface ReorderPlaylistOutput {
  playlist: IPlaylist;
}

export class ReorderPlaylist {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: ReorderPlaylistInput): Promise<ReorderPlaylistOutput> {
    const songsForTag = await this.songRepository.findByTagId(input.tagId);
    const validSongIds = new Set(songsForTag.map((song) => song.id ?? ''));

    for (const songId of input.songIds) {
      if (!validSongIds.has(songId)) throw new InvalidPlaylistSongError();
    }

    const playlist = await this.playlistRepository.save({
      tagId: input.tagId,
      songIds: input.songIds,
    });

    return { playlist };
  }
}
