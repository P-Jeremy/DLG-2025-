import type { ISongRepository } from "../../domain/interfaces/ISongRepository";
import type { IPlaylistRepository } from "../../domain/interfaces/IPlaylistRepository";
import type { IPlaylist } from "../../domain/interfaces/IPlaylist";
import type { IEventEmitter } from "../interfaces/IEventEmitter";
import type { IMetaRepository } from "../../domain/interfaces/IMetaRepository";
import { SongNotFoundError } from "../../domain/errors/DomainError";
import { SONG_EVENTS } from "../constants/events";

export interface AddSongToPlaylistInput {
  playlistName: string;
  songId: string;
}

export interface AddSongToPlaylistOutput {
  playlist: IPlaylist;
}

export class AddSongToPlaylist {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: AddSongToPlaylistInput): Promise<AddSongToPlaylistOutput> {
    const song = await this.songRepository.findById(input.songId);
    if (!song) throw new SongNotFoundError();

    const existingPlaylist = await this.playlistRepository.findByName(input.playlistName);
    const currentSongIds = existingPlaylist ? existingPlaylist.songIds : [];

    const songAlreadyInPlaylist = currentSongIds.includes(input.songId);
    const updatedSongIds = songAlreadyInPlaylist
      ? currentSongIds
      : [...currentSongIds, input.songId];

    const playlist = await this.playlistRepository.save({
      name: input.playlistName,
      songIds: updatedSongIds,
    });

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);

    return { playlist };
  }
}
