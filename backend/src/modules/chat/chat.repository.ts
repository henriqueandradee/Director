import { ChatType } from '@prisma/client';
import { prisma } from '../../config/database';

export const chatRepository = {
  findByUserIdAndCompanyIdAndType(userId: string, companyId: string, type: ChatType) {
    return prisma.chat.findUnique({
      where: { userId_companyId_type: { userId, companyId, type } },
    });
  },

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
};
