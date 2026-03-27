import { PlaylistModel } from '../models/playlistModel';
import { Playlist } from '../../domain/models/Playlist';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { IPlaylist } from '../../domain/interfaces/IPlaylist';
import { PlaylistNotFoundError } from '../../domain/errors/DomainError';

export class PlaylistRepository implements IPlaylistRepository {
  async findByName(name: string): Promise<IPlaylist | null> {
    const doc = await PlaylistModel.findOne({ name }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<IPlaylist[]> {
    const docs = await PlaylistModel.find().exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async save(playlist: IPlaylist): Promise<IPlaylist> {
    const doc = await PlaylistModel.findOneAndUpdate(
      { name: playlist.name },
      { songIds: playlist.songIds },
      { upsert: true, new: true },
    ).exec();

    if (!doc) throw new Error('Failed to save playlist');

    return this.toDomain(doc);
  }

  async deleteByName(name: string): Promise<void> {
    await PlaylistModel.deleteOne({ name }).exec();
  }

  async removeSongFromAll(songId: string): Promise<void> {
    await PlaylistModel.updateMany(
      { songIds: songId },
      { $pull: { songIds: songId } },
    ).exec();
  }

  async rename(name: string, newName: string): Promise<IPlaylist> {
    const doc = await PlaylistModel.findOneAndUpdate(
      { name },
      { name: newName },
      { new: true },
    ).exec();

    if (!doc) throw new PlaylistNotFoundError();

    return this.toDomain(doc);
  }

  private toDomain(doc: { _id: { toString(): string }; name: string; songIds: Array<{ toString(): string }> }): Playlist {
    return new Playlist({
      id: doc._id.toString(),
      name: doc.name,
      songIds: doc.songIds.map((id) => id.toString()),
    });
  }
}
