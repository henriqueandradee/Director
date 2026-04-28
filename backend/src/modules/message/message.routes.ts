import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { aiLimiter } from '../../middlewares/rate-limit.middleware';
import { messageController } from './message.controller';
import { AuthenticatedRequest } from '../../shared/types';

export const messageRouter = Router();

messageRouter.use(authMiddleware);

const wrap =
  (fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res, next);

messageRouter.post('/send', aiLimiter, wrap(messageController.send));
messageRouter.get('/:chatId', wrap(messageController.listByChatId));
