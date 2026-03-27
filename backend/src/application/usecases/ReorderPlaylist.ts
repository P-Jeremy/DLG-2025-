import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import { InvalidPlaylistSongError, PlaylistNotFoundError } from '../../domain/errors/DomainError';

export interface ReorderPlaylistInput {
  playlistName: string;
  songIds: string[];
}

export interface ReorderPlaylistOutput {
  playlist: IPlaylist;
}

export class ReorderPlaylist {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: ReorderPlaylistInput): Promise<ReorderPlaylistOutput> {
    const existingPlaylist = await this.playlistRepository.findByName(input.playlistName);
    if (!existingPlaylist) throw new PlaylistNotFoundError();

    const validSongIds = new Set(existingPlaylist.songIds);

    for (const songId of input.songIds) {
      if (!validSongIds.has(songId)) throw new InvalidPlaylistSongError();
    }

    const playlist = await this.playlistRepository.save({
      name: input.playlistName,
      songIds: input.songIds,
    });

    return { playlist };
  }
}
