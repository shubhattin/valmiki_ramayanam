import { browser } from '$app/environment';
import type { script_and_lang_list_type, script_list_type } from './lang_list';

export const LATIN_BASED_SCRIPTS = ['English', 'Romanized', 'Normal'];

export function get_text_font_class(lang: script_and_lang_list_type | '') {
  // this will be udually used to display in select tags
  if (LATIN_BASED_SCRIPTS.includes(lang)) return '';
  return 'indic-font';
}

export function get_script_for_lang(lang: script_and_lang_list_type): script_list_type {
  if (lang === 'Hindi' || lang === 'English') return 'Devanagari';
  // ^ Name for Sanskrit value in the dropdown is Devanagari
  else if (lang === 'Tamil') return 'Tamil-Extended';
  // Add a default return value to satisfy the return type
  return lang;
}

/**
 * This loads the font family based on files defined in stylesheets
 */
export const load_font = async (font: string) => {
  await document.fonts.load(`1em ${font}`);
};

export const FONT_FAMILY_NAME = {
  NIRMALA_UI: 'Nirmala UI',
  ADOBE_DEVANAGARI: 'AdobeDevanagari',
  ROBOTO: 'Roboto'
};

type fonts_type = keyof typeof FONT_FAMILY_NAME;
type image_font_config_type = Record<
  script_and_lang_list_type,
  {
    font?: fonts_type;
    size?: number;
    space_width_scale?: number;
  }
>;

export const get_font_url = (font: fonts_type, type: 'regular' | 'bold') => {
  if (!browser) return '';
  const FONT_URLS: Record<
    fonts_type,
    {
      regular: string;
      bold: string;
    }
  > = {
    NIRMALA_UI: {
      regular: new URL('/src/fonts/regular/Nirmala.ttf', import.meta.url).href,
      bold: new URL('/src/fonts/bold/NirmalaB.ttf', import.meta.url).href
    },
    ADOBE_DEVANAGARI: {
      regular: new URL('/src/fonts/regular/AdobeDevanagari.otf', import.meta.url).href,
      bold: new URL('/src/fonts/bold/AdobeDevanagariB.otf', import.meta.url).href
    },
    ROBOTO: {
      regular: new URL('/src/fonts/regular/Roboto.ttf', import.meta.url).href,
      bold: new URL('/src/fonts/bold/RobotoB.ttf', import.meta.url).href
    }
  };
  return FONT_URLS[font][type];
};

/**
 * Overrides the default font image config
 */
export const DEFAULT_FONT_IMAGE_CONFIG = {
  Devanagari: {
    size: 1.35,
    space_width_scale: 0.55
  },
  Normal: {
    font: 'ADOBE_DEVANAGARI'
  },
  English: {
    font: 'ADOBE_DEVANAGARI'
  }
} as image_font_config_type;

export const DEFAULT_SPACE_WIDTH = 310;
/**
 * `size` is in rem
 */
export const get_font_family_and_size = (
  script: script_and_lang_list_type,
  usage_context: 'image' | 'app' = 'app'
) => {
  const is_image_context = usage_context === 'image';
  let key: fonts_type = 'NIRMALA_UI';
  let size = 1;
  let space_width_scale = 1;
  if (script === 'Devanagari') {
    key = 'ADOBE_DEVANAGARI';
    size = 1.45;
  } else if (LATIN_BASED_SCRIPTS.includes(script)) {
    key = 'ROBOTO';
  }

  const override_image_conf = DEFAULT_FONT_IMAGE_CONFIG[script];
  if (is_image_context && override_image_conf) {
    // Override the default font size
    if (override_image_conf.font) key = override_image_conf.font;
    if (override_image_conf.size) size = override_image_conf.size;
    if (override_image_conf.space_width_scale)
      space_width_scale = override_image_conf.space_width_scale;
  }

  return {
    family: FONT_FAMILY_NAME[key],
    size,
    key,
    space_width_scale
  };
};
