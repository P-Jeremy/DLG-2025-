import { GetMeta } from '../../src/application/usecases/GetMeta';
import type { IMetaRepository } from '../../src/domain/interfaces/IMetaRepository';

const buildMockMetaRepository = (overrides: Partial<IMetaRepository> = {}): IMetaRepository => ({
  touch: jest.fn().mockResolvedValue(undefined),
  getUpdatedAt: jest.fn().mockResolvedValue(new Date('2024-01-01T00:00:00.000Z')),
  ...overrides,
});

describe('GetMeta use case', () => {
  it('should return the updatedAt date from the repository', async () => {
    const expectedDate = new Date('2024-06-15T12:00:00.000Z');
    const metaRepository = buildMockMetaRepository({
      getUpdatedAt: jest.fn().mockResolvedValue(expectedDate),
    });

    const usecase = new GetMeta(metaRepository);
    const result = await usecase.execute();

    expect(result.updatedAt).toBe(expectedDate);
  });

  it('should call getUpdatedAt on the repository', async () => {
    const metaRepository = buildMockMetaRepository();
    const usecase = new GetMeta(metaRepository);

    await usecase.execute();

    expect(metaRepository.getUpdatedAt).toHaveBeenCalledTimes(1);
  });

  it('should return epoch start date when repository has no document', async () => {
    const epochStart = new Date(0);
    const metaRepository = buildMockMetaRepository({
      getUpdatedAt: jest.fn().mockResolvedValue(epochStart),
    });

    const usecase = new GetMeta(metaRepository);
    const result = await usecase.execute();

    expect(result.updatedAt).toEqual(epochStart);
  });
});
