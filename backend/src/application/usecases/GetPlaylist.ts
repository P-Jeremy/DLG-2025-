import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import type { ISong } from '../../domain/interfaces/Song';

export interface GetPlaylistInput {
  playlistName: string;
}

export interface GetPlaylistOutput {
  playlist: IPlaylist | null;
  songs: ISong[];
}

export class GetPlaylist {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: GetPlaylistInput): Promise<GetPlaylistOutput> {
    const playlist = await this.playlistRepository.findByName(input.playlistName);

    if (!playlist || playlist.songIds.length === 0) {
      return { playlist, songs: [] };
    }

    const songs = await this.songRepository.findByIds(playlist.songIds);
    const songMap = new Map(songs.map((song) => [song.id ?? '', song]));
    const orderedSongs: ISong[] = [];

    for (const songId of playlist.songIds) {
      const song = songMap.get(songId);
      if (song) {
        orderedSongs.push(song);
        songMap.delete(songId);
      }
    }

    for (const remaining of songMap.values()) {
      orderedSongs.push(remaining);
    }

    return { playlist, songs: orderedSongs };
  }
}
