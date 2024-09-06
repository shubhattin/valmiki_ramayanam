export const SCRIPT_LIST = [
  'Sanskrit',
  'Telugu',
  'Tamil',
  'Tamil-Extended',
  'Bengali',
  'Kannada',
  'Gujarati',
  'Malayalam',
  'Odia',
  'Sinhala',
  'Normal',
  'Romanized'
];

export const LANG_LIST = [
  'Hindi',
  'Telugu',
  'Tamil',
  'Bengali',
  'Kannada',
  'Gujarati',
  'Malayalam',
  'Odia',
  'Sinhala'
];
// to update the langs enum in db you have to manually edit the langEnum array in src/db/schema.ts

export type lang_list_type =
  | 'Hindi'
  | 'Telugu'
  | 'Tamil'
  | 'Bengali'
  | 'Kannada'
  | 'Gujarati'
  | 'Malayalam'
  | 'Odia'
  | 'Sinhala';

export const ALL_LANG_SCRIPT_LIST = Array.from(new Set([...LANG_LIST, ...SCRIPT_LIST])).filter(
  (src) => !['Normal'].includes(src)
);
