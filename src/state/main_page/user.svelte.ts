import { createQuery } from '@tanstack/svelte-query';
import { queryClient } from '../query';
import { useSession } from '~/lib/auth-client';
import { get_user_project_info } from '~/lib/auth-info';

export const user_verified_info = createQuery(
  {
    queryKey: ['user_info', 'get_user_verified_status'],
    queryFn: async () => {
      const user_info = useSession().get().data?.user;
      const user_id = user_info!.id;
      const data = await get_user_project_info(user_id);
      return data;
    }
  },
  queryClient
);
