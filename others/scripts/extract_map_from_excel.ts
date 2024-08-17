import { z } from 'zod';
import exceljs from 'exceljs';
import * as fs from 'fs';

const sarga_info_schema = z.object({
	name_devanagari: z.string(),
	name_normal: z.string(),
	index: z.number(),
	shloka_count: z.number(),
	shloka_count_extracted: z.number()
});
const kANDa_info_schema = z.object({
	name_devanagari: z.string(),
	name_normal: z.string(),
	index: z.number(),
	sarga_count: z.number(),
	sarga_count_extracted: z.number(),
	sarga_data: z.array(sarga_info_schema)
});
export const kANDa_list_schema = z.array(kANDa_info_schema);

async function main() {
	const workbook = new exceljs.Workbook();
	await workbook.xlsx.readFile('../../data/ramayan/template/overview.xlsx');
	const worksheet = workbook.getWorksheet(1)!;
	const DATA: [number, string, string][] = [
		[1, 'बालकाण्डम्', 'bAlakANDaH'],
		[2, 'अयोध्याकाण्डम्', 'ayOdhyAkANDaH'],
		[3, 'अरण्यकाण्डम्', 'araNyakANDaH'],
		[4, 'किष्किन्धाकाण्डम्', 'kiShkindhAkANDaH'],
		[5, 'सुन्दरकाण्डम्', 'sundarakANDaH'],
		[6, 'युद्धकाण्डम्', 'yuddhakANDaH'],
		[7, 'उत्तरकाण्डम्', 'uttaralANDaH']
	];
	const res: z.infer<typeof kANDa_info_schema>[] = [];
	for (let kANDa_info of DATA) {
		const sarga_file_names = list_dir(`../../data/ramayan/data/${kANDa_info[0]}. ${kANDa_info[1]}`);
		const INFO_INDEX = 3 * kANDa_info[0] - 1;
		const sagra_list: z.infer<typeof sarga_info_schema>[] = [];
		for (let i_ = 0; i_ < sarga_file_names.length; i_++) {
			const sarga_file_name = sarga_file_names[i_];
			const i = parseInt(sarga_file_name.split('.')[0]);
			const sarga_data: string[] = JSON.parse(
				fs.readFileSync(
					`../../data/ramayan/data/${kANDa_info[0]}. ${kANDa_info[1]}/${sarga_file_name}`,
					'utf-8'
				)
			);
			// console.log([kANDa_info[0], i, sarga_file_name, sarga_data.length]);
			const sarga_norm_name = worksheet.getCell(2 + i, INFO_INDEX).value;
			let sarga_dev_name = worksheet.getCell(2 + i, INFO_INDEX + 1).value ?? '';
			const shloka_count = worksheet.getCell(2 + i, INFO_INDEX + 2).value;
			const sarga_info = sarga_info_schema.parse({
				name_devanagari: sarga_dev_name,
				name_normal: sarga_norm_name,
				index: i,
				shloka_count,
				shloka_count_extracted: sarga_data.length
			});
			sagra_list.push(sarga_info);
		}
		// sort sarga_data along the value index in asc
		sagra_list.sort((a, b) => a.index - b.index);
		const kANDA_dev_name = kANDa_info[1].substring(0, kANDa_info[1].length - 2) + 'ः'; // adding visarga
		const kANDa_infor = kANDa_info_schema.parse({
			name_devanagari: kANDA_dev_name,
			name_normal: kANDa_info[2],
			index: kANDa_info[0],
			sarga_count: parseInt(worksheet.getCell(2, INFO_INDEX + 2).value!.toString()),
			sarga_count_extracted: sagra_list.length,
			sarga_data: sagra_list
		});
		res.push(kANDa_infor);
	}

	fs.writeFileSync('./data/ramayan/ramayan_map.json', JSON.stringify(res, null, 2));
}
main();

function list_dir(dir: string) {
	const files: string[] = fs.readdirSync(dir);
	return files;
}
