import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { protectedProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';
import type { lang_list_type } from '~/tools/lang_list';
import { tasks } from '@trigger.dev/sdk/v3';
import { sarga_translate_schema } from '~/api/routers/ai/ai_types';

process.env.TRIGGER_SECRET_KEY = env.TRIGGER_SECRET_KEY;

export const translate_sarga_route = protectedProcedure
  .input(sarga_translate_schema.input)
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
    const handle = await tasks.trigger('ai_translate_sarga', {
      lang,
      messages
    });

    return { handle, output_type: null! as z.infer<typeof sarga_translate_schema.output> };
  });
