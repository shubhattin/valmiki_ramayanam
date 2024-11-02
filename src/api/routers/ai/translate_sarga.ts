import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { protectedProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';
import type { lang_list_type } from '~/tools/lang_list';

const openai_text_model = createOpenAI({ apiKey: env.OPENAI_API_KEY });

export const translate_sarga_route = protectedProcedure
  .input(
    z.object({
      lang: z.string(),
      messages: z
        .object({
          role: z.union([z.literal('user'), z.literal('assistant')]),
          content: z.string()
        })
        .array()
    })
  )
  .mutation(async ({ ctx: { user }, input: { lang, messages } }) => {
    if (user.user_type !== 'admin') {
      const { allowed_langs } = (await db.query.users.findFirst({
        columns: {
          allowed_langs: true
        },
        where: ({ id }, { eq }) => eq(id, user.id)
      }))!;
      if (!allowed_langs || !allowed_langs.includes(lang as lang_list_type))
        return { success: false };
    }

    try {
      const response = await generateObject({
        model: openai_text_model('gpt-4o'),
        messages,
        schema: z.object({
          translations: z
            .object({
              text: z.string().describe('The trnalstion text'),
              shloka_num: z
                .number()
                .describe(
                  'The index of shlokas to be generated, use 0 for starting and -1 for ending.'
                )
            })
            .array()
            .describe(
              'This array will contain the text and the index of the shlokas to be generated.'
            )
        })
      });
      return response.object;
    } catch {
      return { translations: null };
    }
  });
