import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';
import { DuplicatePlaylistError } from '../../domain/errors/DomainError';

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
  ) {}

  async execute(input: CreatePlaylistInput): Promise<CreatePlaylistOutput> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (existing) throw new DuplicatePlaylistError();

    const playlist = await this.playlistRepository.save({
      name: input.name,
      songIds: [],
    });

    await this.metaRepository.touch();

    return { playlist };
  }
}
