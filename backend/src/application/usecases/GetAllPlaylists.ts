import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';

export interface GetAllPlaylistsOutput {
  playlists: IPlaylist[];
}

export class GetAllPlaylists {
  constructor(
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(): Promise<GetAllPlaylistsOutput> {
    const playlists = await this.playlistRepository.findAll();
    return { playlists };
  }
}
