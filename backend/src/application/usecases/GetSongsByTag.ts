import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { ISong } from '../../domain/interfaces/Song';

export interface GetSongsByTagInput {
  tagId: string;
}

export class GetSongsByTag {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: GetSongsByTagInput): Promise<ISong[]> {
    const [songs, playlist] = await Promise.all([
      this.songRepository.findByTagId(input.tagId),
      this.playlistRepository.findByTagId(input.tagId),
    ]);

    if (!playlist || playlist.songIds.length === 0) {
      return songs;
    }

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

    return orderedSongs;
  }
}
