import { protectedAdminProcedure } from '~/api/trpc_init';
import { tasks } from '@trigger.dev/sdk/v3';
import { get_image_prompt_schema } from './ai_types';

export const get_image_prompt_route = protectedAdminProcedure
  .input(get_image_prompt_schema.input)
  .mutation(async ({ input: { messages } }) => {
    const handle = await tasks.trigger('ai_get_image_prompt', {
      messages
    });
    return handle;
  });
