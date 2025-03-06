import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { protectedProcedure, t } from '~/api/trpc_init';
import { tasks, auth, runs } from '@trigger.dev/sdk/v3';
import { sarga_translate_schema } from '~/api/routers/ai/ai_types';
import { get_user_project_info } from '~/lib/auth-info';

auth.configure({
  secretKey: env.TRIGGER_SECRET_KEY
});

const translate_sarga_route = protectedProcedure
  .input(sarga_translate_schema.input)
  .mutation(async ({ ctx: { user, cookie }, input: { lang_id, messages, model } }) => {
    if (user.role !== 'admin') {
      const data = await get_user_project_info(user.id, cookie);
      if (!user.is_approved) return { success: false };
      const allowed_langs = data.langugaes.map((lang) => lang.lang_id);
      if (!allowed_langs || !allowed_langs.includes(lang_id)) return { success: false };
    }
    const handle = await tasks.trigger('ai_translate_sarga', {
      lang_id,
      messages,
      model
    });

    const run_id = handle.id;

    return { run_id, output_type: null! as z.infer<typeof sarga_translate_schema.output> };
  });

const retrive_run_info_route = protectedProcedure
  .input(z.object({ run_id: z.string() }))
  .output(
    z.union([
      z.object({ completed: z.literal(false) }),
      z.object({
        completed: z.literal(true),
        output: z.any(),
        time_taken: z.number().int()
      }),
      z.object({
        error_code: z.string()
      })
    ])
  )
  .query(async ({ input: { run_id } }) => {
    if (!run_id) return { error_code: 'UNAUTHORIZED' };
    const run_info = await runs.retrieve(run_id);
    if (run_info.status !== 'COMPLETED') return { completed: false };
    else if (run_info.status === 'COMPLETED') {
      const time_taken = run_info.finishedAt!.getTime() - run_info.startedAt!.getTime();
      return { completed: true, output: run_info.output, time_taken };
    }
    return { error_code: run_info.status };
  });

export const trigger_funcs_router = t.router({
  translate_sarga: translate_sarga_route,
  retrive_run_info: retrive_run_info_route
});
