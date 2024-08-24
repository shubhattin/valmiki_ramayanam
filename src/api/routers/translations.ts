import { t, publicProcedure, protectedAdminProcedure } from '@api/trpc_init';
import { db } from '@db/db';
import type { lang_list_type } from '@tools/lang_list';
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

export const translations_router = t.router({
  get_translations_per_sarga: get_translations_per_sarga_router
});
