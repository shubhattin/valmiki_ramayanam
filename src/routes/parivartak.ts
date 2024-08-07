import type ExcelJS from 'exceljs';
import LipiLekhikA from '@tools/converter';

/**
 * To transliterate text in a given Excel file
 * @param workbook `exceljs` workbook object
 * @param sheets_to_process index of workspaces to process, `all` to process all workspaces
 * @param lang_row_index the row number in which language codes are present
 * @param text_col_index the column number in which text of `base_lang` is present
 * @param base_lang_code the language code of the base language
 */
export const transliterate_xlxs_file = async (
	workbook: ExcelJS.Workbook,
	sheets_to_process: number[] | 'all' = 'all',
	lang_row_index: number = 1,
	text_col_index: number = 2,
	base_lang_code: string = 'Sanskrit'
) => {
	const TOTAL_SHEETS = workbook.worksheets.length;
	for (let i_worksheet = 0; i_worksheet < TOTAL_SHEETS; i_worksheet++) {
		if (sheets_to_process !== 'all' && !sheets_to_process.includes(i_worksheet + 1)) continue;
		const worksheet = workbook.worksheets[i_worksheet];

		await LipiLekhikA.k.load_lang(base_lang_code);

		const lang_row = worksheet.getRow(lang_row_index);
		const text_col = worksheet.getColumn(text_col_index);
		const texts: string[] = [];
		text_col.eachCell((cell, i) => {
			if (i > 1 && cell.value) texts.push(cell.value.toString());
		});

		const promises: Promise<void>[] = [];
		lang_row.eachCell((cell, col_i) => {
			const promise = (async () => {
				const lang_name = cell.value?.toLocaleString().trim().replaceAll(' ', ''); // trimming white spaces and
				const lang_code = LipiLekhikA.k.normalize(lang_name);
				if (lang_code && lang_code !== base_lang_code) {
					await LipiLekhikA.k.load_lang(lang_code);
					for (let i = 0; i < texts.length; i++) {
						const text = texts[i];
						const out = LipiLekhikA.parivartak(text, base_lang_code, lang_code);
						worksheet.getCell(i + 2, col_i).value = out;
					}
				}
			})();
			promises.push(promise);
		});
		await Promise.all(promises);
	}
	return workbook;
};
