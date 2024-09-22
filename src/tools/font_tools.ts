import { browser } from '$app/environment';
import type { script_and_lang_list_type, script_list_type } from './lang_list';

export const LATIN_BASED_SCRIPTS = ['English', 'Romanized', 'Normal'];

export function get_text_font_class(lang: script_and_lang_list_type | '') {
  // this will be udually used to display in select tags
  if (LATIN_BASED_SCRIPTS.includes(lang)) return '';
  return 'indic-font';
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
 * `size` is in rem
 */
export const get_font_family_and_size = (script: script_and_lang_list_type) => {
  let key: fonts_type = 'NIRMALA_UI';
  let size = 1;
  if (script === 'Devanagari') {
    key = 'ADOBE_DEVANAGARI';
    size = 1.45;
  } else if (LATIN_BASED_SCRIPTS.includes(script)) {
    key = 'ROBOTO';
  }

  return {
    family: FONT_FAMILY_NAME[key],
    size,
    key
  };
};

export function get_script_for_lang(lang: script_and_lang_list_type): script_list_type {
  if (lang === 'Hindi' || lang === 'English') return 'Devanagari';
  // ^ Name for Sanskrit value in the dropdown is Devanagari
  else if (lang === 'Tamil') return 'Tamil-Extended';
  // Add a default return value to satisfy the return type
  return lang;
}
