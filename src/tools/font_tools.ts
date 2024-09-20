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

export const FONT_FAMILY_NAME = {
  NIRMALA_UI: 'Nirmala UI',
  ADOBE_DEVANGARI: 'AdobeDevanagari'
};

export const FONT_URLS: Record<
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
  ADOBE_DEVANGARI: {
    regular: new URL('/src/fonts/regular/AdobeDevanagari.otf', import.meta.url).href,
    bold: new URL('/src/fonts/bold/AdobeDevanagariB.otf', import.meta.url).href
  }
};
