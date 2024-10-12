import type ExcelJS from 'exceljs';
import LipiLekhikA, { normalize_lang_code, lipi_parivartak_async } from '~/tools/converter';

/**
 * To transliterate text in a given Excel file
 * @param workbook `exceljs` workbook object
 * @param sheets_to_process index of workspaces to process, `all` to process all workspaces
 * @param lang_row_index the row number in which language codes are present, default `1`
 * @param text_col_index the column number in which text of `base_lang` is present, default `2`
 * @param text_row_start_index the row number from which text of `base_lang` starts, default `2`
 * @param base_lang_code the language code of the base language, default `Sanskrit`
 * @param base_folder_path_lipi_parivartak the path of the folder where `lipi-parivaryaka` is present, default `./src` only needed when executng directly
 */
export const transliterate_xlxs_file = async (
  workbook: ExcelJS.Workbook,
  sheets_to_process: number[] | 'all' = 'all',
  lang_row_index: number = 1,
  text_col_index: number = 2,
  text_row_start_index: number = 2,
  base_lang_code: string = 'Sanskrit',
  base_folder_path_lipi_parivartak: string | null = null!,
  translations: Map<string, Map<number, string>> = new Map(),
  shloka_count = 0
) => {
  const TOTAL_SHEETS = workbook.worksheets.length;
  for (let i_worksheet = 0; i_worksheet < TOTAL_SHEETS; i_worksheet++) {
    if (sheets_to_process !== 'all' && !sheets_to_process.includes(i_worksheet + 1)) continue;
    const worksheet = workbook.worksheets[i_worksheet];

    await LipiLekhikA.k.load_lang(
      base_lang_code,
      null,
      false,
      true,
      base_folder_path_lipi_parivartak!
    );

    const lang_row = worksheet.getRow(lang_row_index);
    const text_col = worksheet.getColumn(text_col_index);
    const texts: [number, string][] = [];
    text_col.eachCell((cell, i) => {
      if (i >= text_row_start_index && cell.value && cell.value.toString() !== '')
        texts.push([i, cell.value.toString()]);
    });

    const promises: Promise<void>[] = [];
    lang_row.eachCell((cell, col_i) => {
      const promise = (async () => {
        const lang_split = cell.value!.toLocaleString().trim().split(' ');
        const script_name = cell.value!.toLocaleString().trim().replaceAll(' ', ''); // trimming white spaces and
        const script_code = normalize_lang_code(script_name);
        if (script_code && script_code !== base_lang_code) {
          await LipiLekhikA.k.load_lang(
            script_code,
            null,
            false,
            true,
            base_folder_path_lipi_parivartak!
          );
          for (let val_pair of texts) {
            const text = val_pair[1];
            const i = val_pair[0];
            const out = await lipi_parivartak_async(text, base_lang_code, script_code);
            worksheet.getCell(i, col_i).value = out;
          }
        }
        if (
          lang_split.length === 2 &&
          lang_split[1] === 'Meaning' &&
          translations.has(lang_split[0])
        ) {
          const lang_code = lang_split[0];
          const texts = translations.get(lang_code)!;
          for (let val_pair of texts) {
            const text = val_pair[1];
            let i = val_pair[0];
            if (i === -1) i = shloka_count + 1; // +1 as starts with 0
            i += lang_row_index + 1; // +1 as starts with -1 so to shift +1 forward
            worksheet.getCell(i, col_i).value = text;
          }
        }
      })();
      promises.push(promise);
    });
    await Promise.all(promises);
  }
  return workbook;
};
