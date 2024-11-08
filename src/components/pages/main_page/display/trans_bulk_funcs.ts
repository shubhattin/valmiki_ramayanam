const NON_EXIST_INDICATOR = '---------------';

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
 * - Shloka number can start in ., or :
 */
export function text_to_trans_map(text: string, shloka_count: number) {
  text = text.replaceAll(/(?<=\n\n\n)\n+/gm, '\n\n\n'); // replace extra new lines
  const texts = text.split('\n\n\n');
  const trans_map = new Map<number, string>();
  for (let i = 0; i < texts.length; i++) {
    const shloka = texts[i];
    const shloka_text = /(?<=-?\d+\.|: ).+/gms.exec(shloka)?.[0].trim()!;
    const shloka_num = parseInt(/^-?\d+(?=\.|: )/gm.exec(shloka)?.[0]!);
    console.log([shloka_text, shloka_num]);
    trans_map.set(shloka_num, shloka_text);
  }
  return trans_map;
}
