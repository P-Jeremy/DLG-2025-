import type { Request, Response } from 'express';
import { TagModel } from '../../models/tagModel';

export class TagsController {
  async getTags(_req: Request, res: Response): Promise<void> {
    try {
      const tags = await TagModel.find().sort({ name: 1 }).exec();
      res.json(tags.map((tag) => ({ id: tag._id.toString(), name: tag.name })));
    } catch {
      res.status(500).json({ message: 'Failed to fetch tags' });
    }
  }
}
