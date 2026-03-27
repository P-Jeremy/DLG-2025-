import { SongModel, SongDocument } from '../models/songModel';
import { Song } from '../../domain/models/Song';
import type { ISongRepository, SongSortField } from '../../domain/interfaces/ISongRepository';
import type { ISong } from '../../domain/interfaces/Song';
import { SongNotFoundError } from '../../domain/errors/DomainError';

export class SongRepository implements ISongRepository {
  async getAll(sortBy: SongSortField): Promise<Song[]> {
    const docs = await SongModel.find().sort({ [sortBy]: 1 }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Song | null> {
    const doc = await SongModel.findById(id).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIds(ids: string[]): Promise<Song[]> {
    const docs = await SongModel.find({ _id: { $in: ids } }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async deleteById(id: string): Promise<void> {
    await SongModel.findByIdAndDelete(id).exec();
  }

  async save(song: ISong): Promise<Song> {
    const doc = new SongModel({
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
      tab: song.tab,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(song: ISong): Promise<Song> {
    const updated = await SongModel.findByIdAndUpdate(
      song.id,
      { title: song.title, author: song.author, lyrics: song.lyrics, tab: song.tab },
      { new: true },
    ).exec();
    if (!updated) throw new SongNotFoundError();
    return this.toDomain(updated);
  }

  private toDomain(doc: SongDocument): Song {
    return new Song({
      id: doc._id.toString(),
      title: doc.title,
      author: doc.author,
      lyrics: doc.lyrics,
      tab: doc.tab,
    });
  }
}
