import { MetaModel } from '../models/metaModel';
import type { IMetaRepository } from '../../domain/interfaces/IMetaRepository';

const SINGLETON_KEY = 'global';
const EPOCH_START = new Date(0);

export class MetaRepository implements IMetaRepository {
  async touch(): Promise<void> {
    await MetaModel.findOneAndUpdate(
      { singleton: SINGLETON_KEY },
      { $set: { updatedAt: new Date() } },
      { upsert: true, new: true },
    ).exec();
  }

  async getUpdatedAt(): Promise<Date> {
    const doc = await MetaModel.findOne({ singleton: SINGLETON_KEY }).exec();
    return doc?.updatedAt ?? EPOCH_START;
  }
}
