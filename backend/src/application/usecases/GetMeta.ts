import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';

export interface GetMetaOutput {
  updatedAt: Date;
}

export class GetMeta {
  constructor(private readonly metaRepository: IMetaRepository) {}

  async execute(): Promise<GetMetaOutput> {
    const updatedAt = await this.metaRepository.getUpdatedAt();
    return { updatedAt };
  }
}
