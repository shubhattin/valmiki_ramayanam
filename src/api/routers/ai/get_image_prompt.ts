import { protectedAdminProcedure } from '~/api/trpc_init';
import { tasks } from '@trigger.dev/sdk/v3';
import { get_image_prompt_schema } from './ai_types';
import { env } from '$env/dynamic/private';
import type { get_image_prompt_task } from '~/trigger/ai/get_image_prompt';

process.env.TRIGGER_SECRET_KEY = env.TRIGGER_SECRET_KEY;

export const get_image_prompt_route = protectedAdminProcedure
  .input(get_image_prompt_schema.input)
  .mutation(async ({ input: { messages } }) => {
    const handle = await tasks.trigger<typeof get_image_prompt_task>('ai_get_image_prompt', {
      messages
    });
    return { handle, output_type: null! as typeof get_image_prompt_task };
  });
