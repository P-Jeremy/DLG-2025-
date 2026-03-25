import { RenameTag } from '../../src/application/usecases/RenameTag';
import type { ITagRepository } from '../../src/domain/interfaces/ITagRepository';
import type { ITag } from '../../src/domain/interfaces/Tags';
import { TagNotFoundError } from '../../src/domain/errors/DomainError';

const buildMockTagRepository = (overrides: Partial<ITagRepository> = {}): ITagRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByName: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((tag: ITag) => Promise.resolve({ ...tag, id: 'new-id' })),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('RenameTag use case', () => {
  it('should rename a tag when it exists', async () => {
    const existingTag: ITag = { id: 'tag-1', name: 'old-name' };
    const renamedTag: ITag = { id: 'tag-1', name: 'new-name' };

    const tagRepository = buildMockTagRepository({
      findById: jest.fn().mockResolvedValue(existingTag),
      update: jest.fn().mockResolvedValue(renamedTag),
    });

    const usecase = new RenameTag(tagRepository);
    const { tag } = await usecase.execute({ tagId: 'tag-1', name: 'new-name' });

    expect(tagRepository.update).toHaveBeenCalledWith('tag-1', 'new-name');
    expect(tag).toEqual(renamedTag);
  });

  it('should throw TagNotFoundError when the tag does not exist', async () => {
    const tagRepository = buildMockTagRepository({
      findById: jest.fn().mockResolvedValue(null),
    });

    const usecase = new RenameTag(tagRepository);

    await expect(usecase.execute({ tagId: 'nonexistent', name: 'new-name' })).rejects.toThrow(TagNotFoundError);
    expect(tagRepository.update).not.toHaveBeenCalled();
  });
});
