export function get_text_font(lang: string) {
  if (['English', 'Normal'].includes(lang)) return '';
  else if (lang === 'Romanized') return '';
  return 'indic-font';
}
