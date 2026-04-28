import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { Message, MessageRole } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger/logger';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

function toGeminiRole(role: MessageRole): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user';
}

function buildHistory(messages: Message[]): Content[] {
  // Gemini requires alternating user/model turns — skip system messages
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: toGeminiRole(m.role),
      parts: [{ text: m.content }],
    }));
}

export async function sendToGemini(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const chat = model.startChat({
    history: buildHistory(history),
  });

  logger.debug('Sending message to Gemini', {
    model: env.GEMINI_MODEL,
    historyLength: history.length,
  });

  const result = await chat.sendMessage(userMessage);
  const text = result.response.text();

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}
