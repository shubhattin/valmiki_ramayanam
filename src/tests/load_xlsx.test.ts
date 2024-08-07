// this file should be called root of project
import { describe, it } from 'vitest';
import ExcelJS from 'exceljs';
import LipiLekhikA from '@tools/converter';

// Define file paths
const inputFilePath = './src/tests/data/valmiki_ramayan.xlsx';
const outputFilePath = './src/tests/data/valmiki_ramayan_out.xlsx';
async function processExcelFile() {
	const workbook = new ExcelJS.Workbook();
	// if error occurs rather the test fails
	// try {
	await workbook.xlsx.readFile(inputFilePath);
	const worksheet = workbook.getWorksheet(2)!;

	const lang_row = worksheet.getRow(1);
	const text_col = worksheet.getColumn(3);
	const texts: string[] = [];
	text_col.eachCell((cell, i) => {
		if (i > 1 && cell.value) texts.push(cell.value.toString());
	});
	await LipiLekhikA.k.load_lang('de');
	await LipiLekhikA.k.load_lang('hi');
	lang_row.eachCell(async (cell, col_i) => {
		const lang_name = cell.value?.toLocaleString().trim().replaceAll(' ', ''); // trimming white spaces and
		const lang_code = LipiLekhikA.k.normalize(lang_name);
		if (lang_code) {
			await LipiLekhikA.k.load_lang(lang_code);
			for (let i = 0; i < texts.length; i++) {
				const text = texts[i];
				const out = LipiLekhikA.parivartak(text, 'de', lang_code);
				worksheet.getCell(i + 2, col_i).value = out;
				worksheet.getRow(i + 2).height = 30;
			}
		}
		await workbook.xlsx.writeFile(outputFilePath);
	});
	// } catch (err) {
	// 	console.error('Error processing Excel file:', err);
	// }
}
describe('Opening and making changes to Excel file', () => {
	it('Testing with a example Valmiki Ramayan file', async () => {
		await processExcelFile();
	});
});
