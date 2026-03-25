import type { IPlaylist } from './IPlaylist';

export interface IPlaylistRepository {
  findByTagId(tagId: string): Promise<IPlaylist | null>;
  save(playlist: IPlaylist): Promise<IPlaylist>;
  deleteByTagId(tagId: string): Promise<void>;
  removeSongFromAll(songId: string): Promise<void>;
}
