import type { ISongRepository } from "../../domain/interfaces/ISongRepository";
import type { IPlaylistRepository } from "../../domain/interfaces/IPlaylistRepository";
import type { IPlaylist } from "../../domain/interfaces/IPlaylist";
import type { IEventEmitter } from "../interfaces/IEventEmitter";
import type { IMetaRepository } from "../../domain/interfaces/IMetaRepository";
import { PlaylistNotFoundError, SongNotFoundError } from "../../domain/errors/DomainError";
import { SONG_EVENTS } from "../constants/events";

export interface RemoveSongFromPlaylistInput {
  playlistName: string;
  songId: string;
}

export interface RemoveSongFromPlaylistOutput {
  playlist: IPlaylist;
}

export class RemoveSongFromPlaylist {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: RemoveSongFromPlaylistInput): Promise<RemoveSongFromPlaylistOutput> {
    const existingPlaylist = await this.playlistRepository.findByName(input.playlistName);
    if (!existingPlaylist) throw new PlaylistNotFoundError();

    const song = await this.songRepository.findById(input.songId);
    if (!song) throw new SongNotFoundError();

    const updatedSongIds = existingPlaylist.songIds.filter((id) => id !== input.songId);

    const playlist = await this.playlistRepository.save({
      name: input.playlistName,
      songIds: updatedSongIds,
    });

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);

    return { playlist };
  }
}
