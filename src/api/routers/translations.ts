import { t, publicProcedure, protectedProcedure } from '@api/trpc_init';
import { db } from '@db/db';
import { translations } from '@db/schema';
import type { lang_list_type } from '@tools/lang_list';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const get_translations_per_sarga_router = publicProcedure
  .input(
    z.object({
      lang: z.string(),
      kANDa_num: z.number().int(),
      sarga_num: z.number().int()
    })
  )
  .query(async ({ input: { lang, kANDa_num, sarga_num } }) => {
    const lang_typed = lang as lang_list_type;
    const data = await db.query.translations.findMany({
      columns: {
        text: true,
        shloka_num: true
      },
      where: (struct, { eq, and }) =>
        and(
          eq(struct.lang, lang_typed),
          eq(struct.kANDa_num, kANDa_num),
          eq(struct.sarga_num, sarga_num)
        )
    });
    return data;
  });

export const edit_translation_router = protectedProcedure
  .input(
    z.object({
      lang: z.string(),
      kANDa_num: z.number().int(),
      sarga_num: z.number().int(),
      data: z.object({
        to_add_indexed: z.number().int().array(),
        to_edit_indexed: z.number().int().array(),
        add_data: z.string().array(),
        edit_data: z.string().array()
      })
    })
  )
  .mutation(
    async ({
      ctx: { user },
      input: {
        lang,
        kANDa_num,
        sarga_num,
        data: { add_data, edit_data, to_add_indexed, to_edit_indexed }
      }
    }) => {
      // authorization check to edit or add lang records
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

      // add new records
      if (to_add_indexed.length > 0) {
        const data_to_add = to_add_indexed.map((index, i) => ({
          lang: lang as lang_list_type,
          kANDa_num,
          sarga_num,
          shloka_num: index,
          text: add_data[i]
        }));
        await db.insert(translations).values(data_to_add);
      }

      // update existing records
      const update_promises: Promise<any>[] = [];
      for (let i = 0; i < to_edit_indexed.length; i++) {
        const index = to_edit_indexed[i];
        const text = edit_data[i];
        update_promises.push(
          db
            .update(translations)
            .set({ text })
            .where(
              and(
                eq(translations.lang, lang as lang_list_type),
                eq(translations.kANDa_num, kANDa_num),
                eq(translations.sarga_num, sarga_num),
                eq(translations.shloka_num, index)
              )
            )
        );
      }
      // reolving update promises
      await Promise.all(update_promises);

      return {
        success: true
      };
    }
  );

export const translations_router = t.router({
  get_translations_per_sarga: get_translations_per_sarga_router,
  edit_translation: edit_translation_router
});
