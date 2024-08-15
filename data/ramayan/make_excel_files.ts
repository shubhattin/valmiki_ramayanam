import ExcelJS from 'exceljs';
import ramAyaNa_map from './ramayan_map.json';
import { transliterate_xlxs_file } from '../../src/routes/xlsx_parivartak';
import * as fs from 'fs';
import { z } from 'zod';
import { exec } from 'child_process';

const TEMPLATE_FILE = './template/excel_file_template.xlsx';
const COLUMN_FOR_DEV = 2;
const TEXT_START_ROW = 2;
const OUT_FOLDER = 'out';

async function main() {
	if (fs.existsSync(OUT_FOLDER)) {
		fs.rmSync(OUT_FOLDER, { recursive: true });
	}
	fs.mkdirSync(OUT_FOLDER);
	const start_time = Date.now();

	async function processSarga(
		kANDa_info: (typeof ramAyaNa_map)[0],
		sarga_info: (typeof ramAyaNa_map)[0]['sarga_data'][0]
	) {
		const path = `./data/${kANDa_info.index}/${sarga_info.index}.json`;
		const json_data = z
			.string()
			.array()
			.parse(JSON.parse(fs.readFileSync(path).toString()));
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.readFile(TEMPLATE_FILE);
		const worksheet = workbook.getWorksheet(1)!;

		// adding text to main column
		for (let i = 0; i < json_data.length; i++) {
			worksheet.getCell(i + TEXT_START_ROW, COLUMN_FOR_DEV).value = json_data[i];
		}
		await transliterate_xlxs_file(
			workbook,
			'all',
			1,
			COLUMN_FOR_DEV,
			TEXT_START_ROW,
			'Sanskrit',
			'../../src'
		);

		// saving file to output path
		let sarga_name = sarga_info.name_normal.split('\n')[0];
		const out_path = `${OUT_FOLDER}/${kANDa_info.index}. ${kANDa_info.name_normal}/${sarga_info.index}. ${sarga_name}.xlsx`;
		await workbook.xlsx.writeFile(out_path);
	}

	for (let kANDa_info of ramAyaNa_map) {
		fs.mkdirSync(`${OUT_FOLDER}/${kANDa_info.index}. ${kANDa_info.name_normal}`);
		for (let sarga_info of kANDa_info.sarga_data) {
			await processSarga(kANDa_info, sarga_info);
		}
	}
	const end_time = Date.now();
	console.log('Time :', ((end_time - start_time) / 1000).toPrecision(2), 'seconds');

	// compressing
	exec(`cd ${OUT_FOLDER} && 7z a -t7z -mx=9 ../zipped/rAmAyaNam.7z *`);
}
main();