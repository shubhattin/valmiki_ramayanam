import { protectedAdminProcedure, t } from '@api/trpc_init';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { env } from '$env/dynamic/private';
import type OpenAI from 'openai';
import { z } from 'zod';
import { fetch_post } from '@tools/fetch';

const openai_text_model = createOpenAI({ apiKey: env.OPENAI_API_KEY });

const get_image_prompt_router = protectedAdminProcedure
  .input(
    z.object({
      messages: z
        .object({
          role: z.union([z.literal('user'), z.literal('assistant')]),
          content: z.string()
        })
        .array()
    })
  )
  .mutation(async ({ input: { messages } }) => {
    const result = await generateObject({
      model: openai_text_model('gpt-4o'),
      messages,
      schema: z.object({
        image_prompt: z.string()
      })
    });

    return result.object;
  });

const get_generated_image_router = protectedAdminProcedure
  .input(
    z.object({
      image_prompt: z.string(),
      number_of_images: z.number().int().min(1).max(4)
    })
  )
  .mutation(async ({ input: { image_prompt, number_of_images } }) => {
    const req = await fetch_post('https://api.openai.com/v1/images/generations', {
      json: {
        model: 'dall-e-3',
        prompt: image_prompt,
        n: number_of_images,
        size: '1024x1024',
        quality: 'standard'
      },
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`
      }
    });
    const resp = (await req.json()) as {
      created: number;
      data: {
        revised_prompt: string;
        url: string;
      }[];
    };

    return resp.data;
  });

export const ai_router = t.router({
  get_image_prompt: get_image_prompt_router,
  get_generated_image: get_generated_image_router
});
