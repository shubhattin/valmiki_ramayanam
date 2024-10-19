import ExcelJS from 'exceljs';
import ramAyaNa_map from './ramayan_map.json';
import { transliterate_xlxs_file } from '~/tools/excel/transliterate_xlsx_file';
import * as fs from 'fs';
import { z } from 'zod';
import { exec } from 'child_process';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import js_yaml from 'js-yaml';

const TEMPLATE_FILE = './data/ramayan/template/excel_file_template.xlsx';
const COLUMN_FOR_DEV = 2;
const TEXT_START_ROW = 2;
const OUT_FOLDER = './data/ramayan/out';

const get_translation_data = async () => {
  const data: Map<string, Map<number, string>>[][] = [];
  // [kanda][sarga]

  for (let kANDa_info of ramAyaNa_map) {
    data.push([]); // per kanda
    for (let sarga_info of kANDa_info.sarga_data) {
      data[kANDa_info.index - 1].push(new Map()); // per sarga
    }
  }

  // load local english translations
  for (let kANDa_info of ramAyaNa_map) {
    for (let sarga_info of kANDa_info.sarga_data) {
      const trans_file = `./data/ramayan/trans_en/${kANDa_info.index}/${sarga_info.index}.yaml`;
      // create_if_not_exist(kANDa_info.index - 1, sarga_info.index - 1, 'English');
      if (fs.existsSync(trans_file)) {
        if (!data[kANDa_info.index - 1][sarga_info.index - 1].has('English'))
          data[kANDa_info.index - 1][sarga_info.index - 1].set('English', new Map());
        const trans_data = js_yaml.load(fs.readFileSync(trans_file, 'utf8')) as Record<
          number,
          string
        >;
        for (let shloka_num in trans_data) {
          data[kANDa_info.index - 1][sarga_info.index - 1]
            .get('English')!
            .set(parseInt(shloka_num), trans_data[shloka_num]);
        }
      }
    }
  }
  // loading other translations  from backup file
  if (fs.existsSync('./src/db/scripts/backup/translations.json')) {
    const input: {
      lang: string;
      kANDa_num: number;
      sarga_num: number;
      shloka_num: number;
      text: string;
    }[] = JSON.parse(fs.readFileSync('./src/db/scripts/backup/translations.json', 'utf8'))[
      'translations'
    ] as any;
    for (let item of input) {
      if (!data[item.kANDa_num - 1][item.sarga_num - 1].has(item.lang))
        data[item.kANDa_num - 1][item.sarga_num - 1].set(item.lang, new Map());
      data[item.kANDa_num - 1][item.sarga_num - 1].get(item.lang)!.set(item.shloka_num, item.text);
    }
  }
  return data;
};

async function main() {
  if (fs.existsSync(OUT_FOLDER)) {
    fs.rmSync(OUT_FOLDER, { recursive: true });
  }
  fs.mkdirSync(OUT_FOLDER);
  const start_time = Date.now();

  const translations = await get_translation_data();

  async function processSarga(
    kANDa_info: (typeof ramAyaNa_map)[0],
    sarga_info: (typeof ramAyaNa_map)[0]['sarga_data'][0]
  ) {
    const path = `./data/ramayan/data/${kANDa_info.index}/${sarga_info.index}.json`;
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
      null,
      translations[kANDa_info.index - 1][sarga_info.index - 1],
      sarga_info.shloka_count_extracted
    );

    // saving file to output path
    let sarga_name = sarga_info.name_normal.split('\n')[0];
    const out_path = `${OUT_FOLDER}/${kANDa_info.index}. ${kANDa_info.name_normal}/${sarga_info.index}. ${sarga_name}.xlsx`;
    await workbook.xlsx.writeFile(out_path);
  }
  const TOTAL_SARGAS = ramAyaNa_map.reduce((acc, kANDa) => acc + kANDa.sarga_data.length, 0);
  const progressBar = new cliProgress.SingleBar({
    format: 'Progress |{bar}| {percentage}% | ETA: {eta}s | {value}/{total} Sargas',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  progressBar.start(TOTAL_SARGAS, 0);
  for (let kANDa_info of ramAyaNa_map) {
    fs.mkdirSync(`${OUT_FOLDER}/${kANDa_info.index}. ${kANDa_info.name_normal}`);
    for (let sarga_info of kANDa_info.sarga_data) {
      await processSarga(kANDa_info, sarga_info);
      progressBar.increment();
    }
  }

  progressBar.stop();
  const end_time = Date.now();
  console.log('Time :', ((end_time - start_time) / 1000).toPrecision(2), 'seconds');

  // compressing
  if (!fs.existsSync('./data/ramayan/zipped')) {
    fs.mkdirSync('./data/ramayan/zipped');
  }
  if (!process.argv.slice(2).includes('--no-zip')) {
    exec(`cd ${OUT_FOLDER} && zip -r ../zipped/rAmAyaNam.zip *`, (error) => {
      if (error) {
        console.log(chalk.red.bold('Failed to make zip:', error.message));
      } else {
        console.log(chalk.green.bold('Zip file created successfully!'));
      }
    });
  }
}
main();
