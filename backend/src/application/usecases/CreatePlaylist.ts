import type { IPlaylistRepository } from "../../domain/interfaces/IPlaylistRepository";
import type { IPlaylist } from "../../domain/interfaces/IPlaylist";
import type { IEventEmitter } from "../interfaces/IEventEmitter";
import type { IMetaRepository } from "../../domain/interfaces/IMetaRepository";
import { DuplicatePlaylistError } from "../../domain/errors/DomainError";
import { SONG_EVENTS } from "../constants/events";

export interface CreatePlaylistInput {
  name: string;
}

export interface CreatePlaylistOutput {
  playlist: IPlaylist;
}

export class CreatePlaylist {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: CreatePlaylistInput): Promise<CreatePlaylistOutput> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (existing) throw new DuplicatePlaylistError();

    const playlist = await this.playlistRepository.save({
      name: input.name,
      songIds: [],
    });

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);

    return { playlist };
  }
}
