import type { ITag } from './Tags';

export interface ITagRepository {
  findAll(): Promise<ITag[]>;
  findById(id: string): Promise<ITag | null>;
  findByName(name: string): Promise<ITag | null>;
  save(tag: ITag): Promise<ITag>;
  update(id: string, name: string): Promise<ITag>;
  delete(id: string): Promise<void>;
}
