import type { ITagRepository } from '../../domain/interfaces/ITagRepository';
import type { IPlaylistRepository } from '../../domain/interfaces/IPlaylistRepository';
import type { ISongRepository } from '../../domain/interfaces/ISongRepository';
import { TagNotFoundError } from '../../domain/errors/DomainError';

export interface DeleteTagInput {
  tagId: string;
}

export class DeleteTag {
  constructor(
    private readonly tagRepository: ITagRepository,
    private readonly songRepository: ISongRepository,
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(input: DeleteTagInput): Promise<void> {
    const tag = await this.tagRepository.findById(input.tagId);
    if (!tag) throw new TagNotFoundError();

    await this.songRepository.removeTagFromAll(input.tagId);
    await this.playlistRepository.deleteByTagId(input.tagId);
    await this.tagRepository.delete(input.tagId);
  }
}
