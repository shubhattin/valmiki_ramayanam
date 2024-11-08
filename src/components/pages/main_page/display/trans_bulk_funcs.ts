export function trans_map_to_text(trans_map: Map<number, string>, shloka_count: number) {
  let texts_per_shloka: string[] = [];
  const NON_EXIST_INDICATOR = '---------------';
  const shloka_template_func = (text: string, num: number) => `${num}. ${text}`;

  const check_func = (i: number) => {
    if (trans_map.has(i)) texts_per_shloka.push(shloka_template_func(trans_map.get(i)!, i));
    else texts_per_shloka.push(shloka_template_func(NON_EXIST_INDICATOR, i));
  };
  for (let i = 0; i <= shloka_count; i++) check_func(i);
  check_func(-1);
  return texts_per_shloka.join('\n\n\n');
}
