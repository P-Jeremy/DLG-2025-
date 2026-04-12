import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';
import { PlaylistNotFoundError } from '../../domain/errors/DomainError';

export interface DeletePlaylistInput {
  name: string;
}

export class DeletePlaylist {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
    private readonly metaRepository: IMetaRepository,
  ) {}

  async execute(input: DeletePlaylistInput): Promise<void> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (!existing) throw new PlaylistNotFoundError();

    await this.playlistRepository.deleteByName(input.name);

    await this.metaRepository.touch();
  }
}
