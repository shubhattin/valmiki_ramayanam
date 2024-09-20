export function get_text_font(lang: string) {
  if (['English', 'Normal'].includes(lang)) return '';
  else if (lang === 'Romanized') return '';
  return 'indic-font';
}
/**
 * This loads the font family based on files defined in stylesheets
 */
export const load_font = async (font: string) => {
  await document.fonts.load(`1em ${font}`);
};

type font_fype = {
  fontFamily: string;
  regular_font_url: string;
  bold_font_url: string;
};
export const FONTS_INFO = {
  NIRMALA_UI: {
    fontFamily: 'Nirmala UI',
    regular_font_url: new URL('/src/fonts/regular/Nirmala.ttf', import.meta.url).href,
    bold_font_url: new URL('/src/fonts/bold/NirmalaB.ttf', import.meta.url).href
  },
  ADOBE_DEVANGARI: {
    fontFamily: 'AdobeDevanagari',
    regular_font_url: new URL('/src/fonts/regular/AdobeDevanagari.otf', import.meta.url).href,
    bold_font_url: new URL('/src/fonts/bold/AdobeDevanagariB.otf', import.meta.url).href
  }
};
