import { GetSongsUsecase } from '../../src/application/usecases/GetSongs';
import type { ISongRepository, SongSortField } from '../../src/domain/interfaces/ISongRepository';
import type { ISong } from '../../src/domain/interfaces/Song';

const buildMockRepository = (songs: ISong[]): ISongRepository & { receivedSortBy: SongSortField | undefined } => {
  const mock = {
    receivedSortBy: undefined as SongSortField | undefined,
    getAll(sortBy: SongSortField): Promise<ISong[]> {
      mock.receivedSortBy = sortBy;
      return Promise.resolve(songs);
    },
  };
  return mock;
};

describe('GetSongsUsecase', () => {
  it('should pass sortBy title to the repository', async () => {
    const repository = buildMockRepository([]);
    const usecase = new GetSongsUsecase(repository);

    await usecase.execute('title');

    expect(repository.receivedSortBy).toBe('title');
  });

  it('should pass sortBy author to the repository', async () => {
    const repository = buildMockRepository([]);
    const usecase = new GetSongsUsecase(repository);

    await usecase.execute('author');

    expect(repository.receivedSortBy).toBe('author');
  });

  it('should default sortBy to title when no argument is provided', async () => {
    const repository = buildMockRepository([]);
    const usecase = new GetSongsUsecase(repository);

    await usecase.execute();

    expect(repository.receivedSortBy).toBe('title');
  });

  it('should return the songs provided by the repository', async () => {
    const songs: ISong[] = [
      { title: 'Alpha', author: 'Artist A', lyrics: '', tab: '' },
      { title: 'Beta', author: 'Artist B', lyrics: '', tab: '' },
    ];
    const repository = buildMockRepository(songs);
    const usecase = new GetSongsUsecase(repository);

    const result = await usecase.execute('title');

    expect(result).toEqual(songs);
  });
});
