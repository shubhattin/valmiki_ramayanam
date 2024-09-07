import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { delay } from '@tools/delay';
import { get_derived_query } from '@tools/query';
import { queryClient } from '@state/query';

import { kANDa_selected, sarga_selected } from './main_state';

export const sarga_data = get_derived_query([kANDa_selected, sarga_selected], ([kanda, sarga]) =>
  createQuery(
    {
      queryKey: ['sarga', 'main_dev_text', kanda, sarga],
      enabled: browser && kanda !== 0 && sarga !== 0,
      placeholderData: [],
      queryFn: async () => {
        if (!browser) return [];
        const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
        const data = ((await all_sargas[`/data/ramayan/data/${kanda}/${sarga}.json`]()) as any)
          .default as string[];
        await delay(350);
        return data;
      }
    },
    queryClient
  )
);
