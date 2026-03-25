import type { ITagRepository } from '../../domain/interfaces/ITagRepository';
import type { ITag } from '../../domain/interfaces/Tags';
import { DuplicateTagError } from '../../domain/errors/DomainError';

export interface CreateTagInput {
  name: string;
}

export interface CreateTagOutput {
  tag: ITag;
}

export class CreateTag {
  constructor(private readonly tagRepository: ITagRepository) {}

  async execute(input: CreateTagInput): Promise<CreateTagOutput> {
    const existing = await this.tagRepository.findByName(input.name);
    if (existing) throw new DuplicateTagError();

    const tag = await this.tagRepository.save({ name: input.name });
    return { tag };
  }
}
