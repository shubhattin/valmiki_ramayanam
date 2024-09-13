import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { delay } from '@tools/delay';
import { get_derived_query } from '@tools/query';
import { queryClient } from '@state/query';
import { derived } from 'svelte/store';
import { client_raw } from '@api/client';

import {
  editing_status_on,
  kANDa_selected,
  sarga_selected,
  trans_lang,
  view_translation_status
} from './main_state';

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
          const all_sargas = import.meta.glob('/data/ramayan/data/*/*.json');
          const data = (
            (await all_sargas[
              `/data/ramayan/data/${$kANDa_selected}/${$sarga_selected}.json`
            ]()) as any
          ).default as string[];
          await delay(350);
          return data;
        }
      },
      queryClient
    )
);

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
  if (LOCALS_TRANS_LANGS.includes(lang)) {
    if (lang === 'English') return await load_english_translation(kanda, sarga);
  }
  const data = await client_raw.translations.get_translations_per_sarga.query({
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
  await delay(250);
  let data: Record<number, string> = {};
  const data_map = new Map<number, string>();
  if (import.meta.env.DEV) {
    const yaml = (await import('js-yaml')).default;
    const glob_yaml = import.meta.glob('/data/ramayan/trans_en/*/*.yaml', {
      query: '?raw'
    });
    if (!(`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml` in glob_yaml)) return data_map;
    const text = (
      (await glob_yaml[`/data/ramayan/trans_en/${kANDa_num}/${sarga_number}.yaml`]()) as any
    ).default as string;
    data = yaml.load(text) as Record<number, string>;
  } else {
    const glob_json = import.meta.glob('/data/ramayan/trans_en/json/*/*.json');
    if (!(`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json` in glob_json))
      return data_map;
    data = (
      (await glob_json[`/data/ramayan/trans_en/json/${kANDa_num}/${sarga_number}.json`]()) as any
    ).default as Record<number, string>;
  }

  for (const [key, value] of Object.entries(data)) {
    data_map.set(Number(key), value.replaceAll(/\n$/g, '')); // replace the ending newline
  }
  return data_map;
};
