import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { delay } from '@tools/delay';
import { get_derived_query } from '@tools/query';
import { queryClient } from '@state/query';
import { derived } from 'svelte/store';
import { client } from '@api/client';
import rAmAyaNam_map from '@data/ramayan/ramayan_map.json';
import { lipi_parivartak_async } from '@tools/converter';

import {
  BASE_SCRIPT,
  editing_status_on,
  kANDa_selected,
  sarga_selected,
  trans_lang,
  view_translation_status
} from './main_state';

export { rAmAyaNam_map };
export const QUERY_KEYS = {
  trans_lang_data: (lang: string, kANDa_num: number, sarga_num: number) => [
    'sarga',
    'trans',
    lang,
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
  return Promise.all(data.map((kANDa) => lipi_parivartak_async(kANDa, BASE_SCRIPT, lang)));
};

export const get_sarga_names = async (kANDa_num: number, lang: string) => {
  const data =
    kANDa_num !== 0
      ? rAmAyaNam_map[kANDa_num - 1].sarga_data.map((sarga) => sarga.name_devanagari)
      : [];
  if (!browser) return data;
  return Promise.all(data.map((sarga) => lipi_parivartak_async(sarga, BASE_SCRIPT, lang)));
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
        queryFn: () => get_sarga_data($kANDa_selected, $sarga_selected)
      },
      queryClient
    )
);

export async function get_sarga_data(kANDa_num: number, sarga_num: number) {
  if (!browser) return [];
  // ^ This is to prevent this to be bundled in edge functions as it a limit of 1mb(gzip)
  const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
  const data = ((await all_sargas[`/data/ramayan/data/${kANDa_num}/${sarga_num}.json`]()) as any)
    .default as string[];
  await delay(350);
  return data;
}
// Translations
export const trans_en_data = get_derived_query(
  [kANDa_selected, sarga_selected, view_translation_status],
  ([$kANDa_selected, $sarga_selected, $view_translation_status]) =>
    createQuery(
      {
        queryKey: QUERY_KEYS.trans_lang_data('English', $kANDa_selected, $sarga_selected),
        // by also adding the kanda and sarga they are auto invalidated
        // so we dont have to manually invalidate it if were only sarga,trans,English
        enabled:
          browser && $view_translation_status && $kANDa_selected !== 0 && $sarga_selected !== 0,
        queryFn: () => get_translations($kANDa_selected, $sarga_selected, 'English')
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
        enabled: browser && $trans_lang !== '--' && $kANDa_selected !== 0 && $sarga_selected !== 0,
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
export const LOCALS_TRANS_LANGS = ['English'];

export async function get_translations(kanda: number, sarga: number, lang: string) {
  await delay(400);
  if (LOCALS_TRANS_LANGS.includes(lang)) {
    if (lang === 'English') return await load_english_translation(kanda, sarga);
  }
  const data = await client.translations.get_translations_per_sarga.query({
    lang: lang,
    kANDa_num: kanda,
    sarga_num: sarga
  });
  const data_map = new Map<number, string>();
  for (let val of data) {
    // we dont need to manually care abouy 0 or -1, it will be handled while making changes
    data_map.set(val.shloka_num, val.text);
  }
  return data_map;
}

const load_english_translation = async (kANDa_num: number, sarga_number: number) => {
  let data: Record<number, string> = {};
  const data_map = new Map<number, string>();
  if (!browser) return data_map;
  // ^ This is to prevent this to be bundled in edge functions as it a limit of 1mb(gzip)

  const glob_yaml = import.meta.glob('/data/ramayan/trans_en/*/*.yaml');
  const data_load_function = glob_yaml[`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml`];
  if (!data_load_function) return data_map;
  data = ((await data_load_function()) as any).default as Record<number, string>;
  for (const [key, value] of Object.entries(data))
    data_map.set(Number(key), value.replaceAll(/\n$/g, '')); // replace the ending newline
  return data_map;
};
