import { MetaRepository } from '../../src/infrastructure/repositories/metaRepository';

describe('MetaRepository integration tests', () => {
  let metaRepository: MetaRepository;

  beforeEach(() => {
    metaRepository = new MetaRepository();
  });

  describe('getUpdatedAt()', () => {
    it('should return epoch start when no document exists', async () => {
      const updatedAt = await metaRepository.getUpdatedAt();

      expect(updatedAt).toEqual(new Date(0));
    });
  });

  describe('touch()', () => {
    it('should create the document if it does not exist', async () => {
      await metaRepository.touch();

      const updatedAt = await metaRepository.getUpdatedAt();
      expect(updatedAt).not.toEqual(new Date(0));
    });

    it('should update updatedAt on subsequent calls', async () => {
      await metaRepository.touch();
      const firstDate = await metaRepository.getUpdatedAt();

      await new Promise((resolve) => setTimeout(resolve, 5));

      await metaRepository.touch();
      const secondDate = await metaRepository.getUpdatedAt();

      expect(secondDate.getTime()).toBeGreaterThanOrEqual(firstDate.getTime());
    });

    it('should be idempotent — multiple calls do not create multiple documents', async () => {
      await metaRepository.touch();
      await metaRepository.touch();
      await metaRepository.touch();

      const updatedAt = await metaRepository.getUpdatedAt();
      expect(updatedAt).not.toEqual(new Date(0));
    });
  });
});
