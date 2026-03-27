import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import { DuplicatePlaylistError, PlaylistNotFoundError } from '../../domain/errors/DomainError';

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
  ) {}

  async execute(input: RenamePlaylistInput): Promise<RenamePlaylistOutput> {
    const existing = await this.playlistRepository.findByName(input.name);
    if (!existing) throw new PlaylistNotFoundError();

    const nameConflict = await this.playlistRepository.findByName(input.newName);
    if (nameConflict) throw new DuplicatePlaylistError();

    const playlist = await this.playlistRepository.rename(input.name, input.newName);

    return { playlist };
  }
}
