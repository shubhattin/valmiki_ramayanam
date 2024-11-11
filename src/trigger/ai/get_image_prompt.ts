import { task } from '@trigger.dev/sdk/v3';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { get_image_prompt_schema } from '~/api/routers/ai/ai_types';

const openai_text_model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const get_image_prompt_task = task({
  id: 'ai_get_image_prompt',
  maxDuration: 150, // in seconds
  run: async (payload: z.infer<typeof get_image_prompt_schema.input>) => {
    payload = get_image_prompt_schema.input.parse(payload);
    const { messages } = payload;

    try {
      const result = await generateObject({
        model: openai_text_model('gpt-4o'),
        messages,
        schema: z.object({
          image_prompt: z.string()
        })
      });
      return result.object;
    } catch (e) {
      return { image_prompt: null };
    }
  }
});
