import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { chatController } from './chat.controller';
import { AuthenticatedRequest } from '../../shared/types';

export const chatRouter = Router();

chatRouter.use(authMiddleware);

const wrap =
  (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res, next);

chatRouter.get('/', wrap(chatController.list));
chatRouter.post('/', wrap(chatController.getOrCreate));
