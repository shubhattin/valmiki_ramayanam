import { browser } from '$app/environment';
import { createQuery, type CreateQueryResult } from '@tanstack/svelte-query';
import { delay } from '@tools/delay';
import { derived, writable } from 'svelte/store';
import type { StoresValues, Writable } from 'svelte/store';
import { queryClient } from '@state/query';

export let kANDa_selected = writable(0);
export let sarga_selected = writable(0);

export let editing_status_on = writable(false);
export const BASE_SCRIPT = 'Sanskrit';

export let viewing_script = writable<string>();
export let trans_lang = writable<string>();

export let sanskrit_mode = writable<number>();

const get_query = <
  Stores extends Writable<any>[],
  Val,
  E,
  SvelteQuery extends CreateQueryResult<Val, E>
>(
  stores: [...Stores],
  query_func: (vals: StoresValues<Stores>) => SvelteQuery // Map stores to their inner values
) => {
  type result = StoresValues<SvelteQuery>;
  // OR
  // type result = Parameters<Parameters<SvelteQuery['subscribe']>[0]>[0];
  return derived<typeof stores, result>(stores, (vals, set) => {
    const query = query_func(vals);
    const unsub = query.subscribe((state) => set(state as result));
    return () => {
      unsub();
    };
  });
};

export const sarga_data = get_query([kANDa_selected, sarga_selected], ([kanda, sarga]) =>
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
