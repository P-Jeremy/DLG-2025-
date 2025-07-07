
import { TagModel } from '../../src/infrastructure/models/tagModel';
import { ITag } from '../../src/domain/interfaces/Tags';

export const insertTestTags = async (tags: Array<Omit<ITag, 'id'>>): Promise<unknown[]> => {
  return TagModel.insertMany(tags);
};
