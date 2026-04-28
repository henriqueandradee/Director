import { AppError } from '../../shared/errors/AppError';
import { companyRepository } from '../company/company.repository';
import { chatService } from '../chat/chat.service';
import { messageRepository } from './message.repository';
import { sendToGrok } from '../../integrations/llm/grok.client';
import { buildSystemPrompt } from '../../integrations/llm/prompt.builder';
import { logger } from '../../shared/logger/logger';

export const messageService = {
  async send(chatId: string, userId: string, content: string) {
    const chat = await chatService.assertOwnership(chatId, userId);

    const company = await companyRepository.findById(chat.companyId);
    if (!company) throw AppError.notFound('Company');

    // Persist the user message first
    await messageRepository.create(chatId, 'user', content);

    // Get recent history for context window (last 20 messages)
    const history = await messageRepository.findByChatIdLimited(chatId, 20);
    // Exclude the message we just saved (it's the last one)
    const historyWithoutCurrent = history.slice(0, -1);

    const systemPrompt = buildSystemPrompt(chat.type, company);

    logger.info('Calling Grok', { chatId, type: chat.type, historyLength: historyWithoutCurrent.length });

    const aiResponse = await sendToGrok(systemPrompt, historyWithoutCurrent, content);

    const assistantMessage = await messageRepository.create(chatId, 'assistant', aiResponse);

    return assistantMessage;
  },

  async listByChatId(chatId: string, userId: string) {
    await chatService.assertOwnership(chatId, userId);
    return messageRepository.findByChatId(chatId);
  },
};
