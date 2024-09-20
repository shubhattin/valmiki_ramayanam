import { writable } from 'svelte/store';

type bounding_coords_type = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type shloka_type_config = {
  bounding_coords: bounding_coords_type;
  main_text_font_size: number;
  norm_text_font_size: number;
  trans_text_font_size: number;
  reference_lines_top: number[];
};

export const DEFAULT_SHLOKA_TYPE_2_CONFIG: shloka_type_config = {
  bounding_coords: {
    left: 540,
    top: 80,
    right: 1850,
    bottom: 600
  },
  main_text_font_size: 63,
  norm_text_font_size: 48,
  trans_text_font_size: 52,
  reference_lines_top: [310, 510]
};

export let current_shloka_type = writable<number>();
export const SPACE_ABOVE_REFERENCE_LINE = 10;
export const SPACE_BETWEEN_MAIN_AND_NORM = 1;

export let shloka_configs = writable({
  2: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  3: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  4: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  5: DEFAULT_SHLOKA_TYPE_2_CONFIG
});
