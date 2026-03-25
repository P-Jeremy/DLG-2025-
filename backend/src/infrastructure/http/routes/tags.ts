import { Router, Request, Response } from 'express';
import { TagsController } from '../controllers/tagsController';
import { CreateTag } from '../../../application/usecases/CreateTag';
import { DeleteTag } from '../../../application/usecases/DeleteTag';
import { RenameTag } from '../../../application/usecases/RenameTag';
import { TagRepository } from '../../repositories/tagRepository';
import { SongRepository } from '../../repositories/songRepository';
import { PlaylistRepository } from '../../repositories/playlistRepository';
import { authenticate } from '../middlewares/authenticate';
import { requireAdmin } from '../middlewares/requireAdmin';

export function createTagsRouter(): Router {
  const router = Router();

  const tagRepository = new TagRepository();
  const songRepository = new SongRepository();
  const playlistRepository = new PlaylistRepository();

  const createTagUsecase = new CreateTag(tagRepository);
  const deleteTagUsecase = new DeleteTag(tagRepository, songRepository, playlistRepository);
  const renameTagUsecase = new RenameTag(tagRepository);

  const controller = new TagsController(createTagUsecase, deleteTagUsecase, renameTagUsecase);

  router.get('/tags', async (req: Request, res: Response) => {
    await controller.getTags(req, res);
  });

  router.post('/tags', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.createTag(req, res);
  });

  router.patch('/tags/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.renameTag(req, res);
  });

  router.delete('/tags/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
    await controller.deleteTag(req, res);
  });

  return router;
}
