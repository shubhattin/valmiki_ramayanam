import type { RequestHandler } from './$types';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { env } from '$env/dynamic/private';
import { z } from 'zod';

const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });

const messages_schema = z
  .object({
    role: z.union([z.literal('user'), z.literal('assistant')]),
    content: z.string()
  })
  .array();

export const POST: RequestHandler = async ({ request }) => {
  const req_obj = await request.json();
  const messages = messages_schema.parse(req_obj.messages);

  console.log(messages);

  const result = await streamText({
    model: openai('gpt-4o'),
    messages
  });

  return result.toDataStreamResponse();
};
