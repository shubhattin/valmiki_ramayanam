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
