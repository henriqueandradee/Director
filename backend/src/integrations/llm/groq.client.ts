import { Message, MessageRole } from '@prisma/client';
import { env } from '../../config/env';
import { logger } from '../../shared/logger/logger';
import { AppError } from '../../shared/errors/AppError';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function toGroqRole(role: MessageRole): 'user' | 'assistant' {
  return role === 'assistant' ? 'assistant' : 'user';
}

function buildMessages(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
): GroqMessage[] {
  const messages: GroqMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of history) {
    if (msg.role === 'system') continue;
    messages.push({ role: toGroqRole(msg.role), content: msg.content });
  }

  messages.push({ role: 'user', content: userMessage });

  return messages;
}

export async function sendToGroq(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
): Promise<string> {
  const messages = buildMessages(systemPrompt, history, userMessage);

  logger.debug('Sending message to Groq', {
    model: env.GROQ_MODEL,
    historyLength: history.length,
  });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Groq API error', { status: response.status, body: errorText });
      
      // Parse error text if it's JSON to make it cleaner
      let errorMessage = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // Not JSON, keep original text
      }
      
      throw new AppError(`Erro na API do Groq: ${errorMessage}`, 502, 'GROQ_API_ERROR');
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new AppError('Resposta vazia do Groq', 502, 'GROQ_EMPTY_RESPONSE');
    }

    return text;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    logger.error('Groq API network error', { error });
    throw new AppError(`Falha ao conectar com a API do Groq: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 502, 'GROQ_NETWORK_ERROR');
  }
}
