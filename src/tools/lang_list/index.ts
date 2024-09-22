import { script_list, lang_list } from './langs.json';

export const SCRIPT_LIST = Object.keys(script_list);
export type script_list_type = keyof typeof script_list;

export const LANG_LIST = Object.keys(lang_list);
export type lang_list_type = keyof typeof lang_list;
export type lang_list_extended_type = lang_list_type | 'English';
// the langs enum in schema.ts has to be updated manually

export const ALL_LANG_SCRIPT_LIST = Array.from(new Set([...LANG_LIST, ...SCRIPT_LIST])).filter(
  (src) => !['Normal'].includes(src)
);

export type script_and_lang_list_type = script_list_type | lang_list_extended_type;
export { lang_list as lang_list_obj, script_list as script_list_obj };
