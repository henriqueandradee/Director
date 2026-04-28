import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../shared/types';
import { messageService } from './message.service';

const sendSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID'),
  content: z.string().min(1, 'Message content cannot be empty').max(4000, 'Message too long'),
});

export const messageController = {
  async send(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { chatId, content } = sendSchema.parse(req.body);
      const message = await messageService.send(chatId, req.user.id, content);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },

  async listByChatId(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const messages = await messageService.listByChatId(String(req.params.chatId), req.user.id);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  },
};
