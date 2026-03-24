import { Router, Request, Response } from 'express';
import { TagsController } from '../controllers/tagsController';

const router = Router();
const controller = new TagsController();

router.get('/tags', async (req: Request, res: Response) => {
  await controller.getTags(req, res);
});

export default router;
