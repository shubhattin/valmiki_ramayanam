import { protectedAdminProcedure, t } from '@api/trpc_init';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { env } from '$env/dynamic/private';
import { Configuration, OpenAIApi, type ResponseTypes } from 'openai-edge';
import { z } from 'zod';

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

const config = new Configuration({
  apiKey: env.OPENAI_API_KEY
});

const openai = new OpenAIApi(config);

const get_generated_image_router = protectedAdminProcedure
  .input(
    z.object({
      image_prompt: z.string()
    })
  )
  .mutation(async ({ input: { image_prompt } }) => {
    const response = await openai.createImage({
      prompt: image_prompt,
      size: '1024x1024',
      response_format: 'url'
    });

    const data = (await response.json()) as ResponseTypes['createImage'];

    const url = data.data?.[0]?.url;
    return url;
  });

export const ai_router = t.router({
  get_image_prompt: get_image_prompt_router,
  get_generated_image: get_generated_image_router
});
