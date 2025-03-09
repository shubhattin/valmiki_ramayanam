import * as fs from 'fs';
import js_yaml from 'js-yaml';
import { LANG_LIST, LANG_LIST_IDS } from '../../src/tools/lang_list';

// this file should be called from root dir
async function main() {
  if (!fs.existsSync('./src/db/scripts/backup/translations.json')) return;

  const translations = JSON.parse(
    fs.readFileSync('./src/db/scripts/backup/translations.json', 'utf8')
  )['translations'] as {
    lang_id: number;
    kANDa_num: number;
    sarga_num: number;
    shloka_num: number;
    text: string;
  }[];
  const trans_folder = './data/ramayan/translations/';
  if (fs.existsSync(trans_folder)) fs.rmSync(trans_folder, { recursive: true });
  fs.mkdirSync(trans_folder);

  // lang, kanda, sarga
  const data: {
    [lang: string]: {
      [kANDa_num: number]: {
        [sarga_num: number]: Map<number, string>;
        // ^ the keys are not number even if we make in number as that is how javascript is
      };
    };
  } = {};

  for (let trans of translations) {
    const lang_nm = LANG_LIST[LANG_LIST_IDS.indexOf(trans.lang_id)];
    if (!data[lang_nm]) {
      fs.mkdirSync(`./data/ramayan/translations/${lang_nm}`);
      data[lang_nm] = {};
    }
    if (!data[lang_nm][trans.kANDa_num]) {
      fs.mkdirSync(`./data/ramayan/translations/${lang_nm}/${trans.kANDa_num}`);
      data[lang_nm][trans.kANDa_num] = {};
    }
    if (!data[lang_nm][trans.kANDa_num][trans.sarga_num])
      data[lang_nm][trans.kANDa_num][trans.sarga_num] = new Map();
    data[lang_nm][trans.kANDa_num][trans.sarga_num].set(trans.shloka_num, trans.text);
  }

  for (let lang in data) {
    for (let kANDa_num in data[lang]) {
      for (let sarga_num in data[lang][kANDa_num]) {
        const sarga_data = data[lang][kANDa_num][sarga_num];
        const sarga_file = `./data/ramayan/translations/${lang}/${kANDa_num}/${sarga_num}.yaml`;
        fs.writeFileSync(
          sarga_file,
          js_yaml.dump(Object.fromEntries(sarga_data), { indent: 2, lineWidth: 500 }),
          {
            encoding: 'utf-8'
          }
        );
      }
    }
  }
}
main();
