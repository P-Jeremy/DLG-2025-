import { CreateTag } from '../../src/application/usecases/CreateTag';
import type { ITagRepository } from '../../src/domain/interfaces/ITagRepository';
import type { ITag } from '../../src/domain/interfaces/Tags';
import { DuplicateTagError } from '../../src/domain/errors/DomainError';

const buildMockTagRepository = (overrides: Partial<ITagRepository> = {}): ITagRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByName: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockImplementation((tag: ITag) => Promise.resolve({ ...tag, id: 'new-tag-id' })),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('CreateTag use case', () => {
  it('should create a tag when name is unique', async () => {
    const savedTag: ITag = { id: 'new-tag-id', name: 'rock' };
    const tagRepository = buildMockTagRepository({
      findByName: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(savedTag),
    });

    const usecase = new CreateTag(tagRepository);
    const { tag } = await usecase.execute({ name: 'rock' });

    expect(tag).toEqual(savedTag);
    expect(tagRepository.save).toHaveBeenCalledWith({ name: 'rock' });
  });

  it('should throw DuplicateTagError when tag name already exists', async () => {
    const existingTag: ITag = { id: 'existing-id', name: 'rock' };
    const tagRepository = buildMockTagRepository({
      findByName: jest.fn().mockResolvedValue(existingTag),
    });

    const usecase = new CreateTag(tagRepository);

    await expect(usecase.execute({ name: 'rock' })).rejects.toThrow(DuplicateTagError);
    expect(tagRepository.save).not.toHaveBeenCalled();
  });
});
