import { Message, MessageRole } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger/logger';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

interface GrokMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function toGrokRole(role: MessageRole): 'user' | 'assistant' {
  return role === 'assistant' ? 'assistant' : 'user';
}

function buildMessages(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
): GrokMessage[] {
  const messages: GrokMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of history) {
    if (msg.role === 'system') continue;
    messages.push({ role: toGrokRole(msg.role), content: msg.content });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

export async function sendToGrok(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const messages = buildMessages(systemPrompt, history, userMessage);

  logger.debug('Sending message to Grok', {
    model: env.GROK_MODEL,
    historyLength: history.length,
  });

  const response = await fetch(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.GROK_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Grok API error', { status: response.status, body: errorText });
    throw new Error(`Grok API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Empty response from Grok');
  }

  return text;
}
