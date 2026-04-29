import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { ChatType } from '@prisma/client';
import { AuthenticatedRequest } from '../../shared/types';
import { chatService } from './chat.service';

const createChatSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  type: z.nativeEnum(ChatType, { errorMap: () => ({ message: 'Invalid chat type. Use: marketing, sales, revenue, business' }) }),
});

export const chatController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const chats = await chatService.listByUser(req.user.id);
      res.json(chats);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, type } = createChatSchema.parse(req.body);
      const chat = await chatService.create(req.user.id, companyId, type);
      res.status(201).json(chat);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      await chatService.delete(id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
