import type { ISongRepository } from '../interfaces/ISongRepository';
import type { ISong } from '../interfaces/Song';

export class GetSongsUsecase {
  constructor(private readonly songRepo: ISongRepository) {}

  async execute(): Promise<ISong[]> {
    return this.songRepo.getAll();
  }
}
