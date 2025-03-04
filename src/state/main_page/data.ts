import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { delay } from '~/tools/delay';
import { get_derived_query } from '~/tools/query';
import { queryClient } from '~/state/query';
import { derived, writable } from 'svelte/store';
import { client } from '~/api/client';
import rAmAyaNam_map from '@data/ramayan/ramayan_map.json';
import { lipi_parivartak } from '~/tools/converter';

import {
  BASE_SCRIPT,
  editing_status_on,
  kANDa_selected,
  sarga_selected,
  trans_lang,
  view_translation_status
} from './main_state';
import ms from 'ms';

export { rAmAyaNam_map };
export const QUERY_KEYS = {
  trans_lang_data: (lang_id: number, kANDa_num: number, sarga_num: number) => [
    'sarga',
    'trans',
    lang_id,
    kANDa_num,
    sarga_num
  ],
  sarga_data: (kANDa_num: number, sarga_num: number) => [
    'sarga',
    'main_dev_text',
    kANDa_num,
    sarga_num
  ]
};

// NAMES
export const get_kANDa_names = async (lang: string) => {
  const data = rAmAyaNam_map.map((kANDa) => kANDa.name_devanagari);
  if (!browser) return data;
  return lipi_parivartak(data, BASE_SCRIPT, lang);
};

export const get_sarga_names = async (kANDa_num: number, lang: string) => {
  const data =
    kANDa_num !== 0
      ? rAmAyaNam_map[kANDa_num - 1].sarga_data.map((sarga) => sarga.name_devanagari)
      : [];
  if (!browser) return data;
  return lipi_parivartak(data, BASE_SCRIPT, lang);
};

// SARGA_DATA
export const sarga_data = get_derived_query(
  [kANDa_selected, sarga_selected],
  ([$kANDa_selected, $sarga_selected]) =>
    createQuery(
      {
        queryKey: QUERY_KEYS.sarga_data($kANDa_selected, $sarga_selected),
        enabled: browser && $kANDa_selected !== 0 && $sarga_selected !== 0,
        placeholderData: [],
        queryFn: async () => {
          if (!browser) return [];
          return await client.translations.get_sarga_data.query({
            kANDa_num: $kANDa_selected,
            sarga_num: $sarga_selected
          });
        }
      },
      queryClient
    )
);

// Translations
export const trans_en_data = get_derived_query(
  [kANDa_selected, sarga_selected, view_translation_status, editing_status_on],
  ([$kANDa_selected, $sarga_selected, $view_translation_status, $editing_status_on]) =>
    createQuery(
      {
        queryKey: QUERY_KEYS.trans_lang_data(1, $kANDa_selected, $sarga_selected),
        // by also adding the kanda and sarga they are auto invalidated
        // so we dont have to manually invalidate it if were only sarga,trans,English
        enabled:
          browser && $view_translation_status && $kANDa_selected !== 0 && $sarga_selected !== 0,
        ...($editing_status_on
          ? {
              staleTime: Infinity
              // while editing the data should not go stale, else it would refetch lead to data loss
            }
          : {}),
        queryFn: () => get_translations($kANDa_selected, $sarga_selected, 1) // 1 -> English
      },
      queryClient
    )
);

export const trans_lang_data_query_key = derived(
  [trans_lang, kANDa_selected, sarga_selected],
  ([$trans_lang, $kANDa_selected, $sarga_selected], set: (value: (string | number)[]) => void) => {
    set(QUERY_KEYS.trans_lang_data($trans_lang, $kANDa_selected, $sarga_selected));
  }
);
export const trans_lang_data = get_derived_query(
  [trans_lang_data_query_key, trans_lang, kANDa_selected, sarga_selected, editing_status_on],
  ([
    $trans_lang_data_query_key,
    $trans_lang,
    $kANDa_selected,
    $sarga_selected,
    $editing_status_on
  ]) =>
    createQuery(
      {
        queryKey: $trans_lang_data_query_key,
        enabled: browser && $trans_lang !== 0 && $kANDa_selected !== 0 && $sarga_selected !== 0,
        ...($editing_status_on
          ? {
              staleTime: Infinity
              // while editing the data should not go stale, else it would refetch lead to data loss
            }
          : {}),
        queryFn: () => get_translations($kANDa_selected, $sarga_selected, $trans_lang)
      },
      queryClient
    )
);
export async function get_translations(kanda: number, sarga: number, lang_id: number) {
  await delay(400);

  const data_map = await client.translations.get_translations_per_sarga.query({
    lang_id: lang_id,
    kANDa_num: kanda,
    sarga_num: sarga
  });
  return data_map;
}

export let english_edit_status = writable(false);

export let bulk_text_edit_status = writable(false);
export let bulk_text_data = writable('');
