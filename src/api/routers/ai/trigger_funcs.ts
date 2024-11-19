import { z } from 'zod';
import { env } from '$env/dynamic/private';
import { protectedProcedure, t } from '~/api/trpc_init';
import { db } from '~/db/db';
import { tasks, auth, runs } from '@trigger.dev/sdk/v3';
import { sarga_translate_schema } from '~/api/routers/ai/ai_types';
import { JWT_SECRET } from '~/tools/jwt.server';
import { jwtVerify, SignJWT } from 'jose';
import type { lang_list_type } from '~/tools/lang_list';

auth.configure({
  secretKey: env.TRIGGER_SECRET_KEY
});

const run_info_token_schema = z.object({
  run_id: z.string()
});
const RUN_TOKEN_EXPIRE = '10mins';

const translate_sarga_route = protectedProcedure
  .input(sarga_translate_schema.input)
  .mutation(async ({ ctx: { user }, input: { lang, messages, model } }) => {
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
      messages,
      model
    });

    const run_token = await new SignJWT({
      run_id: handle.id
    } satisfies z.infer<typeof run_info_token_schema>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(RUN_TOKEN_EXPIRE)
      .sign(JWT_SECRET);

    return { run_token, output_type: null! as z.infer<typeof sarga_translate_schema.output> };
  });

const retrive_run_info_route = protectedProcedure
  .input(z.object({ run_token: z.string() }))
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
  .query(async ({ input: { run_token } }) => {
    let run_id: string | null = null;
    try {
      const jwt_data = await jwtVerify(run_token, JWT_SECRET, {
        algorithms: ['HS256']
      });
      const payload = run_info_token_schema.parse(jwt_data.payload);
      run_id = payload.run_id;
    } catch {}
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
