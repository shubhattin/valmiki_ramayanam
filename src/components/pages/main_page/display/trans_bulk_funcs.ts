export const NON_EXIST_INDICATOR = '---------------';

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
 * - Each shloka should be separated by two or more blank lines
 * - **Format 1**
 *   - Shloka number can be indicated in either `{num}. {text}` or `{num}: {text}` format. {text} can be of multiple lines.
 *   - Three or more `-` will make the shloka being ignored or marked as non existent.
 *   - You are free to place shlokas any order as they have their index markers along with them.
 * - **Format 2**
 *   - If shlokas have missing index markers then they will be interpreted in the usual order, i.e. 0, 1, 2 to last and -1.
 *   - Shlokas can't be inserted in between with this format
 */
export function text_to_trans_map(text: string, shloka_count: number) {
  text = text.replaceAll(/(?<=\n\n\n)\n+/gm, '\n\n\n'); // replace extra new lines
  const texts = text.split('\n\n\n');
  const trans_map = new Map<number, string>();
  for (let i = 0; i < texts.length; i++) {
    const shloka = texts[i];
    const shloka_text = /(?<=-?\d+\.|: ).+/gms.exec(shloka)?.[0].trim()!;
    const shloka_num = parseInt(/^-?\d+(?=\.|: )/gm.exec(shloka)?.[0]!); // shloka number extractions
    if (shloka_num >= -1 && shloka_num <= shloka_count && !/^---+$/g.test(shloka_text))
      // ignore if line starts with --- or more dashes
      trans_map.set(shloka_num, shloka_text);
  }
  return trans_map;
}
