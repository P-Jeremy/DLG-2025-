import { TagModel } from '../models/tagModel';
import { Tag } from '../../domain/models/Tag';
import type { ITagRepository } from '../../domain/interfaces/ITagRepository';
import type { ITag } from '../../domain/interfaces/Tags';

export class TagRepository implements ITagRepository {
  async findAll(): Promise<ITag[]> {
    const docs = await TagModel.find().sort({ name: 1 }).exec();
    return docs.map((doc) => new Tag({ id: doc._id.toString(), name: doc.name }));
  }

  async findById(id: string): Promise<ITag | null> {
    const doc = await TagModel.findById(id).exec();
    if (!doc) return null;
    return new Tag({ id: doc._id.toString(), name: doc.name });
  }

  async findByName(name: string): Promise<ITag | null> {
    const doc = await TagModel.findOne({ name }).exec();
    if (!doc) return null;
    return new Tag({ id: doc._id.toString(), name: doc.name });
  }

  async save(tag: ITag): Promise<ITag> {
    const doc = await new TagModel({ name: tag.name }).save();
    return new Tag({ id: doc._id.toString(), name: doc.name });
  }

  async update(id: string, name: string): Promise<ITag> {
    const doc = await TagModel.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    ).exec();
    if (!doc) throw new Error('Tag not found');
    return new Tag({ id: doc._id.toString(), name: doc.name });
  }

  async delete(id: string): Promise<void> {
    await TagModel.deleteOne({ _id: id }).exec();
  }
}
