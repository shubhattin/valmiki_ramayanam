import type { CreateQueryResult } from '@tanstack/svelte-query';
import type { StoresValues, Writable } from 'svelte/store';
import { derived } from 'svelte/store';

/**
 * Get a derived store from a `svelte-query` function and a list of stores
 */
export const get_derived_query = <
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
