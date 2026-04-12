import type { Request, Response } from 'express';
import { GetMeta } from '../../../application/usecases/GetMeta';
import { MetaRepository } from '../../repositories/metaRepository';

export async function getMeta(_req: Request, res: Response): Promise<void> {
  const metaRepository = new MetaRepository();
  const usecase = new GetMeta(metaRepository);
  const { updatedAt } = await usecase.execute();
  res.json({ updatedAt: updatedAt.toISOString() });
}
