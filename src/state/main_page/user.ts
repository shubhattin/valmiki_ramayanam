import type { ID_TOKEN_INFO_SCHEMA } from '@tools/auth_tools';
import { z } from 'zod';
import { writable } from 'svelte/store';
import { get_derived_query } from '@tools/query';
import { queryClient } from '@state/query';
import { client } from '@api/client';
import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';

export const user_info = writable<z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null>(null);
export const user_allowed_langs = get_derived_query([user_info], ([$user_info]) =>
  createQuery(
    {
      enabled: !!(browser && $user_info && $user_info.user_type !== 'admin'),
      queryKey: [['user_info', 'get_user_allowed_langs'], { type: 'query' }],
      queryFn: () => client.user_info.get_user_allowed_langs.query(),
      placeholderData: []
    },
    queryClient
  )
);
