import { ChatType } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { companyRepository } from '../company/company.repository';
import { chatRepository } from './chat.repository';

export const chatService = {
  async getOrCreate(userId: string, companyId: string, type: ChatType) {
    const company = await companyRepository.findById(companyId);
    if (!company) throw AppError.notFound('Company');
    if (company.userId !== userId) throw AppError.forbidden();

    const existing = await chatRepository.findByUserIdAndCompanyIdAndType(userId, companyId, type);
    if (existing) return existing;

    return chatRepository.create(userId, companyId, type);
  },

  async listByUser(userId: string) {
    return chatRepository.findAllByUserId(userId);
  },

  async assertOwnership(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw AppError.notFound('Chat');
    if (chat.userId !== userId) throw AppError.forbidden();
    return chat;
  },
};
