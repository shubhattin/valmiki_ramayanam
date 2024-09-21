import { browser } from '$app/environment';

export function get_text_font_class(lang: string) {
  // this will be udually used to display in select tags
  if (['English', 'Normal', 'Romanized'].includes(lang)) return '';
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

export const get_font_url = (font: keyof typeof FONT_FAMILY_NAME, type: 'regular' | 'bold') => {
  if (!browser) return '';
  const FONT_URLS: Record<
    keyof typeof FONT_FAMILY_NAME,
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
export const get_font_family_and_size = (script: string) => {
  let family = 'Nirmala UI';
  let size = 1;
  if (script === 'Sanskrit') {
    family = FONT_FAMILY_NAME.ADOBE_DEVANAGARI;
    size = 1.45;
  } else if (['Normal', 'English', 'Romanized'].includes(script)) {
    family = 'Roboto';
  }

  return {
    family,
    size
  };
};
