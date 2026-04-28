import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { companyRepository } from './company.repository';

export const companyService = {
  async create(userId: string, data: Omit<Prisma.CompanyCreateInput, 'user'>) {
    return companyRepository.create(userId, data as Prisma.CompanyCreateInput);
  },

  async getById(id: string, userId: string) {
    const company = await companyRepository.findById(id);
    if (!company) throw AppError.notFound('Company');
    if (company.userId !== userId) throw AppError.forbidden();
    return company;
  },

  async listByUser(userId: string) {
    return companyRepository.findByUserId(userId);
  },

  async update(id: string, userId: string, data: Prisma.CompanyUpdateInput) {
    const company = await companyRepository.findById(id);
    if (!company) throw AppError.notFound('Company');
    if (company.userId !== userId) throw AppError.forbidden();
    return companyRepository.update(id, data);
  },
};
