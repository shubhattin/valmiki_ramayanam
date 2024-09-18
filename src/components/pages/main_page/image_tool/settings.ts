import { writable } from 'svelte/store';

type bounding_coords_type = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

type shloka_type_config = {
  bounding_coords: bounding_coords_type;
  space_between_lines: number;
  space_between_main_and_norm_text: number;
  main_text_font_size: number;
  norm_text_font_size: number;
  trans_text_font_size: number;
};

export const DEFAULT_SHLOKA_TYPE_2_CONFIG: shloka_type_config = {
  bounding_coords: {
    left: 540,
    top: 80,
    right: 1850,
    bottom: 600
  },
  main_text_font_size: 65,
  norm_text_font_size: 50,
  trans_text_font_size: 52,
  space_between_lines: 0,
  space_between_main_and_norm_text: 0
};

export let shloka_configs = writable({
  2: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  3: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  4: DEFAULT_SHLOKA_TYPE_2_CONFIG,
  5: DEFAULT_SHLOKA_TYPE_2_CONFIG
});
