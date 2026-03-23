
import { SongModel, SongDocument } from '../models/songModel';
import { Song } from '../../domain/models/Song';
import { Tag } from '../../domain/models/Tag';
import type { ISongRepository, SongSortField } from '../../domain/interfaces/ISongRepository';

export class SongRepository implements ISongRepository {
  async getAll(sortBy: SongSortField): Promise<Song[]> {
    const docs = await SongModel.find().sort({ [sortBy]: 1 }).populate('tags').exec();
    return docs.map((doc) => this.toDomain(doc));
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
