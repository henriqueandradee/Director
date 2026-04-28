import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';

export const companyRepository = {
  create(userId: string, data: Prisma.CompanyCreateInput) {
    return prisma.company.create({ data: { ...data, user: { connect: { id: userId } } } });
  },

  findById(id: string) {
    return prisma.company.findUnique({ where: { id } });
  },

  findByUserId(userId: string) {
    return prisma.company.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  update(id: string, data: Prisma.CompanyUpdateInput) {
    return prisma.company.update({ where: { id }, data });
  },
};
