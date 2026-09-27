import { OpenRouter } from '@openrouter/sdk';
import type { ChatMessages } from '@openrouter/sdk/models';
import { ApiError } from '@/lib/errors';
import { worldAgentResponseSchema, type worldAgentResponse } from '@/sharedTypes/chat/chat.model';
import { buildWorldSystemPrompt } from './systemPrompt';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const model = process.env.OPENROUTER_MODEL || 'openrouter/free';

/** One prior exchange in the agent conversation. */
export interface agentTurn {
  role: 'user' | 'assistant';
  content: string;
}

function toMessage(turn: agentTurn): ChatMessages {
  return turn.role === 'user'
    ? { role: 'user', content: turn.content }
    : { role: 'assistant', content: turn.content };
}

function contentToText(content: string | Array<unknown> | null | undefined): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((item) => {
      if (item && typeof item === 'object' && 'text' in item) {
        const text = (item as { text?: unknown }).text;
        return typeof text === 'string' ? text : '';
      }
      return '';
    })
    .join('');
}

/** Models sometimes wrap JSON in prose or code fences; recover the object. */
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? trimmed).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

/**
 * Runs one agentic turn: feeds the world-builder system prompt plus the full
 * conversation history to the model and returns its validated reply.
 */
export async function generateWorldTurn(history: agentTurn[], message: string): Promise<worldAgentResponse> {
  const completion = await openRouter.chat.send({
    chatRequest: {
      model,
      responseFormat: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildWorldSystemPrompt() },
        ...history.map(toMessage),
        { role: 'user', content: message },
      ],
    },
  });

  if (!('choices' in completion)) {
    throw new ApiError(502, 'The dream weaver returned an unexpected response.');
  }

  const raw = contentToText(completion.choices[0]?.message.content);
  const parsed = worldAgentResponseSchema.safeParse(extractJson(raw));
  if (!parsed.success) {
    console.error('World agent returned an invalid response:', raw);
    throw new ApiError(502, "I couldn't dream that up — the world came back unreadable. Please try again.");
  }

  return parsed.data;
}
