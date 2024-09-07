import { browser } from '$app/environment';
import { createQuery } from '@tanstack/svelte-query';
import { delay } from '@tools/delay';
import { get_derived_query } from '@tools/query';
import { queryClient } from '@state/query';
import { derived } from 'svelte/store';

import { kANDa_selected, sarga_selected, trans_lang, view_translation_status } from './main_state';

// SARGA_DATA
export const sarga_data = get_derived_query(
  [kANDa_selected, sarga_selected],
  ([$kANDa_selected, $sarga_selected]) =>
    createQuery(
      {
        queryKey: ['sarga', 'main_dev_text', $kANDa_selected, $sarga_selected],
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
export const QUERY_KEYS = {
  trans_lang_data: (lang: string, kANDa_num: number, sarga_num: number) => [
    'sarga',
    'trans',
    lang,
    kANDa_num,
    sarga_num
  ]
};
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
        queryFn: () => load_english_translation($kANDa_selected, $sarga_selected)
      },
      queryClient
    )
);
export const load_english_translation = async (kANDa_num: number, sarga_number: number) => {
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
export const trans_lang_data_query_key = derived(
  [trans_lang, kANDa_selected, sarga_selected],
  ([$trans_lang, $kANDa_selected, $sarga_selected], set: (value: (string | number)[]) => void) => {
    set(QUERY_KEYS.trans_lang_data($trans_lang, $kANDa_selected, $sarga_selected));
  }
);
