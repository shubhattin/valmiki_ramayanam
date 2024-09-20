import { copy_plain_object } from '@tools/kry';
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
  reference_lines: {
    top: number;
    spacing: number;
  };
};

type shloka_number_type = 1 | 2 | 3 | 4 | 5;

export const DEFAULT_SHLOKA_CONFIG: Record<shloka_number_type, shloka_type_config> = {
  1: {
    bounding_coords: {
      left: 540,
      top: 70,
      right: 1850,
      bottom: 600
    },
    main_text_font_size: 70,
    norm_text_font_size: 48,
    trans_text_font_size: 52,
    reference_lines: {
      top: 410,
      spacing: 0
    }
  },
  2: {
    bounding_coords: {
      left: 540,
      top: 70,
      right: 1850,
      bottom: 600
    },
    main_text_font_size: 63,
    norm_text_font_size: 48,
    trans_text_font_size: 52,
    reference_lines: {
      top: 310,
      spacing: 200
    }
  },
  3: {
    bounding_coords: {
      left: 540,
      top: 70,
      right: 1850,
      bottom: 600
    },
    main_text_font_size: 55,
    norm_text_font_size: 43,
    trans_text_font_size: 52,
    reference_lines: {
      top: 230,
      spacing: 150
    }
  },
  4: {
    bounding_coords: {
      left: 540,
      top: 70,
      right: 1850,
      bottom: 600
    },
    main_text_font_size: 45,
    norm_text_font_size: 40,
    trans_text_font_size: 52,
    reference_lines: {
      top: 200,
      spacing: 130
    }
  },
  5: {
    bounding_coords: {
      left: 540,
      top: 40,
      right: 1850,
      bottom: 600
    },
    main_text_font_size: 40,
    norm_text_font_size: 35,
    trans_text_font_size: 52,
    reference_lines: {
      top: 150,
      spacing: 110
    }
  }
};

export const SPACE_ABOVE_REFERENCE_LINE = writable(10);
export const SPACE_BETWEEN_MAIN_AND_NORM = writable(1);

export let shloka_configs = writable(copy_plain_object(DEFAULT_SHLOKA_CONFIG));

export let current_shloka_type = writable<shloka_number_type>();
