import { ChatType } from '@prisma/client';
import { prisma } from '../../config/database';

export const chatRepository = {
  create(userId: string, companyId: string, type: ChatType) {
    return prisma.chat.create({ data: { userId, companyId, type } });
  },

  findAllByUserId(userId: string) {
    return prisma.chat.findMany({
      where: { userId },
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.chat.findUnique({ where: { id } });
  },

  delete(id: string) {
    return prisma.chat.delete({ where: { id } });
  },
};
