import type { IPlaylistRepository } from "../../domain/interfaces/IPlaylistRepository";
import type { IEventEmitter } from "../interfaces/IEventEmitter";
import type { IMetaRepository } from "../../domain/interfaces/IMetaRepository";
import { PlaylistNotFoundError } from "../../domain/errors/DomainError";
import { SONG_EVENTS } from "../constants/events";

export interface DeletePlaylistInput {
  name: string;
}

export class DeletePlaylist {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
    private readonly eventEmitter: IEventEmitter,
  ) {}

  async execute(input: DeletePlaylistInput): Promise<void> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (!existing) throw new PlaylistNotFoundError();

    await this.playlistRepository.deleteByName(input.name);

    await this.metaRepository.touch();

    this.eventEmitter.emit(SONG_EVENTS.REFRESH);
  }
}
