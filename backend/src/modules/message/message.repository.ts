import { MessageRole } from '@prisma/client';
import { prisma } from '../../config/database';

export const messageRepository = {
  create(chatId: string, role: MessageRole, content: string) {
    return prisma.message.create({ data: { chatId, role, content } });
  },

  findByChatId(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });
  },

  findByChatIdLimited(chatId: string, limit = 20) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }).then((msgs) => msgs.reverse());
  },
};
