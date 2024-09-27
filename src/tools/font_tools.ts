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
type supported_font_formats = 'ttf' | 'otf';

const FONT_FILE_INFO: Record<
  fonts_type,
  {
    file_name: string;
    file_type: supported_font_formats;
  }
> = {
  NIRMALA_UI: {
    file_name: 'Nirmala',
    file_type: 'ttf'
  },
  ADOBE_DEVANAGARI: {
    file_name: 'AdobeDevanagari',
    file_type: 'otf'
  },
  ROBOTO: {
    file_name: 'Roboto',
    file_type: 'ttf'
  }
};

type image_font_config_type = Record<
  script_and_lang_list_type,
  {
    font?: fonts_type;
    size?: number;
  }
>;

export const get_font_url = (font: fonts_type, type: 'regular' | 'bold') => {
  if (!browser) return '';
  const font_file_info = FONT_FILE_INFO[font];

  const font_url = {
    regular: new URL(
      `/src/fonts/regular/${font_file_info.file_name}.${font_file_info.file_type}`,
      import.meta.url
    ).href,
    bold: new URL(
      `/src/fonts/bold/${font_file_info.file_name}B.${font_file_info.file_type}`,
      import.meta.url
    ).href
  }[type];
  return font_url;
};

/**
 * Default font config for main web app
 */
const DEFAULT_FONT_MAIN_CONFIG = {
  Devanagari: {
    font: 'ADOBE_DEVANAGARI',
    size: 1.45
  },
  English: {
    font: 'ROBOTO'
  },
  Romanized: {
    font: 'ROBOTO'
  },
  Normal: {
    font: 'ROBOTO'
  }
} as image_font_config_type;

/**
 * Overrides the default font image config from `DEFAULT_FONT_MAIN_CONFIG`
 */
export const DEFAULT_FONT_IMAGE_CONFIG = {
  Devanagari: {
    size: 1.35
  },
  Normal: {
    font: 'ADOBE_DEVANAGARI'
  },
  English: {
    font: 'ADOBE_DEVANAGARI',
    size: 1.2
  },
  Romanized: {
    font: 'ADOBE_DEVANAGARI'
  }
} as image_font_config_type;

/**
 * `size` is in rem
 */
export const get_font_family_and_size = (
  script: script_and_lang_list_type,
  usage_context: 'image' | 'app' = 'app'
) => {
  let key: fonts_type = 'NIRMALA_UI';
  let size = 1;
  const main_app_conf = DEFAULT_FONT_MAIN_CONFIG[script];
  if (main_app_conf) {
    if (main_app_conf.font) key = main_app_conf.font;
    if (main_app_conf.size) size = main_app_conf.size;
  }

  const image_conf = DEFAULT_FONT_IMAGE_CONFIG[script];
  if (usage_context === 'image' && image_conf) {
    // Override the default font size
    if (image_conf.font) key = image_conf.font;
    if (image_conf.size) size = image_conf.size;
  }

  return {
    family: FONT_FAMILY_NAME[key],
    size,
    key
  };
};
