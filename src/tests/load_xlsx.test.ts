// this file should be called root of project
import { describe, it } from 'vitest';
import ExcelJS from 'exceljs';
import { normalize_lang_code, lipi_parivartak_async } from '~/tools/converter';

// Define file paths
const inputFilePath = './src/tests/data/nAradavAkyam.xlsx';
const outputFilePath = './src/tests/data/nAradavAkyam_out.xlsx';
async function processExcelFile() {
  const workbook = new ExcelJS.Workbook();
  // if error occurs rather the test fails
  // try {
  await workbook.xlsx.readFile(inputFilePath);
  const worksheet = workbook.getWorksheet(1)!;

  const lang_row = worksheet.getRow(1);
  const text_col = worksheet.getColumn(2);
  const texts: string[] = [];
  text_col.eachCell((cell, i) => {
    if (i > 1 && cell.value) texts.push(cell.value.toString());
  });
  const promises: Promise<void>[] = [];
  lang_row.eachCell((cell, col_i) => {
    const promise = (async () => {
      const lang_name = cell.value!.toLocaleString().trim().replaceAll(' ', ''); // trimming white spaces and
      const lang_code = normalize_lang_code(lang_name);
      if (lang_code && lang_code !== 'Sanskrit') {
        for (let i = 0; i < texts.length; i++) {
          const text = texts[i];
          const out = await lipi_parivartak_async(text, 'de', lang_code);
          worksheet.getCell(i + 2, col_i).value = out;
        }
      }
    })();
    promises.push(promise);
  });
  await Promise.all(promises);
  await workbook.xlsx.writeFile(outputFilePath);
  // } catch (err) {
  // 	console.error('Error processing Excel file:', err);
  // }
}
describe('Opening and making changes to Excel file', () => {
  it('Testing with a example Valmiki Ramayan file', async () => {
    await processExcelFile();
  });
});
