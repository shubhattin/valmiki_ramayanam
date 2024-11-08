const NON_EXIST_INDICATOR = '---------------';
const EXTRA_NEW_LINE_REGEX = /(?<=\n\n\n)\n+/gm;

export function trans_map_to_text(trans_map: Map<number, string>, shloka_count: number) {
  let texts_per_shloka: string[] = [];
  const shloka_template_func = (text: string, num: number) => `${num}. ${text}`;

  const check_func = (i: number) => {
    if (trans_map.has(i)) texts_per_shloka.push(shloka_template_func(trans_map.get(i)!, i));
    else texts_per_shloka.push(shloka_template_func(NON_EXIST_INDICATOR, i));
  };
  for (let i = 0; i <= shloka_count; i++) check_func(i);
  check_func(-1);
  return texts_per_shloka.join('\n\n\n');
}

/**
 * Rules for text
 * - Each shloka should be separated by two blank lines(`\n\n\n`)
 * - Shloka number can be indicated in either `{num}. {text}` or `{num}- {text}` format
 * - If shloka number is not there then it will be interpreted in its usual order
 */
export function text_to_trans_map(text: string, shloka_count: number) {
  text = text.replaceAll(EXTRA_NEW_LINE_REGEX, '\n\n\n');
  const texts = text.split('\n\n\n');
  const trans_map = new Map<number, string>();
  return trans_map;
}
