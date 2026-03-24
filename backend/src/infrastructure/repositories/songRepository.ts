
import { SongModel, SongDocument } from '../models/songModel';
import { Song } from '../../domain/models/Song';
import { Tag } from '../../domain/models/Tag';
import type { ISongRepository, SongSortField } from '../../domain/interfaces/ISongRepository';
import type { ISong } from '../../domain/interfaces/Song';

export class SongRepository implements ISongRepository {
  async getAll(sortBy: SongSortField): Promise<Song[]> {
    const docs = await SongModel.find().sort({ [sortBy]: 1 }).populate('tags').exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async save(song: ISong): Promise<Song> {
    const tagIds = song.tags ? song.tags.map((tag) => tag.id).filter(Boolean) : [];
    const doc = new SongModel({
      title: song.title,
      author: song.author,
      lyrics: song.lyrics,
      tab: song.tab,
      tags: tagIds,
    });
    const saved = await doc.save();
    await saved.populate('tags');
    return this.toDomain(saved);
  }

  private toDomain(doc: SongDocument): Song {
    return new Song({
      id: doc._id.toString(),
      title: doc.title,
      author: doc.author,
      lyrics: doc.lyrics,
      tab: doc.tab,
      tags: Array.isArray(doc.tags)
        ? doc.tags.map((tag) => {
            const { _id, name } = tag as { _id: { toString(): string }; name: string };
            return new Tag({
              id: _id.toString(),
              name,
            });
          })
        : [],
    });
  }
}
