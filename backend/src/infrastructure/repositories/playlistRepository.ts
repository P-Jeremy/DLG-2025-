import { PlaylistModel } from '../models/playlistModel';
import { Playlist } from '../../domain/models/Playlist';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';

export class PlaylistRepository implements IPlaylistRepository {
  async findByTagId(tagId: string): Promise<IPlaylist | null> {
    const doc = await PlaylistModel.findOne({ tagId }).exec();
    if (!doc) return null;
    return new Playlist({
      id: doc._id.toString(),
      tagId: doc.tagId.toString(),
      songIds: doc.songIds.map((id) => id.toString()),
    });
  }

  async save(playlist: IPlaylist): Promise<IPlaylist> {
    const doc = await PlaylistModel.findOneAndUpdate(
      { tagId: playlist.tagId },
      { songIds: playlist.songIds },
      { upsert: true, new: true },
    ).exec();

    if (!doc) throw new Error('Failed to save playlist');

    return new Playlist({
      id: doc._id.toString(),
      tagId: doc.tagId.toString(),
      songIds: doc.songIds.map((id) => id.toString()),
    });
  }

  async deleteByTagId(tagId: string): Promise<void> {
    await PlaylistModel.deleteOne({ tagId }).exec();
  }

  async removeSongFromAll(songId: string): Promise<void> {
    await PlaylistModel.updateMany(
      { songIds: songId },
      { $pull: { songIds: songId } },
    ).exec();
  }
}
