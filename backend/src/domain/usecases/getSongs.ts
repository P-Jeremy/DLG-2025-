import { SongRepository } from '../../infrastructure/repositories/songRepository';
import { ISong } from '../interfaces/Song';

export class GetSongsUsecase {
  private songRepo: SongRepository;

  constructor(songRepo: SongRepository) {
    this.songRepo = songRepo;
  }

  async execute(): Promise<ISong[]> {
    return this.songRepo.getAll();
  }
}
