import { createQuery } from '@tanstack/svelte-query';
import { queryClient } from '../query';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { useSession } from '~/lib/auth-client';
import ky from 'ky';

export const PROJECT_ID = 1; // as defined in tsc_user database
export const AUTH_INFO_URL = `${PUBLIC_BETTER_AUTH_URL}/hono`;

type user_verfied_info_type =
  | { is_approved: false }
  | {
      is_approved: true;
      langugaes: {
        lang_id: number;
        lang_name: string;
      }[];
    };

const user_info = useSession().get().data?.user;

export const user_verified_info = createQuery(
  {
    queryKey: ['user_info', 'get_user_verified_status'],
    queryFn: async () => {
      const user_id = user_info!.id;
      const data = await ky
        .get<user_verfied_info_type>(`${AUTH_INFO_URL}/user/${user_id}/${PROJECT_ID}`)
        .json();
      return data;
    },
    enabled: user_info?.role !== 'admin'
  },
  queryClient
);
