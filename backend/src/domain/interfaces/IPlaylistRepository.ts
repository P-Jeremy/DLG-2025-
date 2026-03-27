import type { IPlaylist } from './IPlaylist';

export interface IPlaylistRepository {
  findByName(name: string): Promise<IPlaylist | null>;
  findAll(): Promise<IPlaylist[]>;
  save(playlist: IPlaylist): Promise<IPlaylist>;
  deleteByName(name: string): Promise<void>;
  removeSongFromAll(songId: string): Promise<void>;
  rename(name: string, newName: string): Promise<IPlaylist>;
}
