import { protectedAdminProcedure, t } from '~/api/trpc_init';
import { generateObject } from 'ai';
import { z } from 'zod';
import { ai_sample_data } from './sample_data/sample_data';
import { delay } from '~/tools/delay';
import { createOpenAI } from '@ai-sdk/openai';
import { env } from '$env/dynamic/private';

const openai_text_model = createOpenAI({ apiKey: env.OPENAI_API_KEY });

export const get_image_prompt_route = protectedAdminProcedure
  .input(
    z.object({
      messages: z
        .object({
          role: z.union([z.literal('user'), z.literal('assistant')]),
          content: z.string()
        })
        .array(),
      use_sample_data: z.boolean().optional().default(false)
    })
  )
  .mutation(async ({ input: { messages, use_sample_data } }) => {
    if (use_sample_data) {
      await delay(1000);
      return { image_prompt: ai_sample_data.sample_text_prompt };
    }
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
  });
