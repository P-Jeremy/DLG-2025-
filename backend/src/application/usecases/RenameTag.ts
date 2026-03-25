import type { ITagRepository } from '../../domain/interfaces/ITagRepository';
import type { ITag } from '../../domain/interfaces/Tags';
import { TagNotFoundError } from '../../domain/errors/DomainError';

export interface RenameTagInput {
  tagId: string;
  name: string;
}

export interface RenameTagOutput {
  tag: ITag;
}

export class RenameTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(input: RenameTagInput): Promise<RenameTagOutput> {
    const existing = await this.tagRepository.findById(input.tagId);
    if (!existing) throw new TagNotFoundError();

    const tag = await this.tagRepository.update(input.tagId, input.name);
    return { tag };
  }
}
