import { z } from 'zod';
import type { get_image_prompt_task } from '~/trigger/ai/get_image_prompt';

export const get_image_prompt_schema = {
  input: z.object({
    messages: z
      .object({
        role: z.union([z.literal('user'), z.literal('assistant')]),
        content: z.string()
      })
      .array()
  }),
  output: z.promise(z.object({ image_prompt: z.string().nullable() }))
};
