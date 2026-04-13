import type { IPlaylistRepository } from "../../domain/interfaces/IPlaylistRepository";
import type { IPlaylist } from "../../domain/interfaces/IPlaylist";
import type { IEventEmitter } from "../interfaces/IEventEmitter";
import type { IMetaRepository } from "../../domain/interfaces/IMetaRepository";
import { DuplicatePlaylistError, PlaylistNotFoundError } from "../../domain/errors/DomainError";
import { SONG_EVENTS } from "../constants/events";

export interface RenamePlaylistInput {
  name: string;
  newName: string;
}

export interface RenamePlaylistOutput {
  playlist: IPlaylist;
}

export class RenamePlaylist {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: RenamePlaylistInput): Promise<RenamePlaylistOutput> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (!existing) throw new PlaylistNotFoundError();

    const nameConflict = await this.playlistRepository.findByName(input.newName);
    if (nameConflict) throw new DuplicatePlaylistError();

    const playlist = await this.playlistRepository.rename(input.name, input.newName);

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);

    return { playlist };
  }
}
