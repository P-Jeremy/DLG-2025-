import type { Request, Response } from 'express';
import type { CreateTag } from '../../../application/usecases/CreateTag';
import type { DeleteTag } from '../../../application/usecases/DeleteTag';
import type { RenameTag } from '../../../application/usecases/RenameTag';
import { TagModel } from '../../models/tagModel';
import { DuplicateTagError, TagNotFoundError } from '../../../domain/errors/DomainError';

export class TagsController {
  constructor(
    private readonly createTagUsecase: CreateTag,
    private readonly deleteTagUsecase: DeleteTag,
    private readonly renameTagUsecase: RenameTag,
  ) {}

  async getTags(_req: Request, res: Response): Promise<void> {
    try {
      const tags = await TagModel.find().sort({ name: 1 }).exec();
      res.json(tags.map((tag) => ({ id: tag._id.toString(), name: tag.name })));
    } catch {
      res.status(500).json({ message: 'Failed to fetch tags' });
    }
  }

  async createTag(req: Request, res: Response): Promise<void> {
    const { name } = req.body as { name?: string };

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'name is required' });
      return;
    }

    try {
      const { tag } = await this.createTagUsecase.execute({ name: name.trim() });
      res.status(201).json({ id: tag.id, name: tag.name });
    } catch (error) {
      if (error instanceof DuplicateTagError) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to create tag' });
    }
  }

  async deleteTag(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string;

    try {
      await this.deleteTagUsecase.execute({ tagId: id });
      res.status(200).json({ message: 'Tag deleted' });
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to delete tag' });
    }
  }

  async renameTag(req: Request, res: Response): Promise<void> {
    const id = req.params['id'] as string;
    const { name } = req.body as { name?: string };

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'name is required' });
      return;
    }

    try {
      const { tag } = await this.renameTagUsecase.execute({ tagId: id, name: name.trim() });
      res.status(200).json({ id: tag.id, name: tag.name });
    } catch (error) {
      if (error instanceof TagNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Failed to rename tag' });
    }
  }
}
