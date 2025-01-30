import { generateObject } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import { createOpenAI } from '@ai-sdk/openai';
import * as fs from 'fs';
// @ts-ignore
import { take_input } from '~/tools/kry.server';
import chalk from 'chalk';
import rAmAyanam_map from '../ramayan_map.json';

dotenv.config({
  path: '../../../.env.local'
});

const openai_text_model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generate_summary = async (kANDa_number: number, sarga_number: number) => {
  if (!fs.existsSync('summaries')) fs.mkdirSync('summaries');
  const data: string[] = JSON.parse(
    fs.readFileSync(`../data/${kANDa_number}/${sarga_number}.json`, 'utf-8')
  );
  const kanda_info = rAmAyanam_map[kANDa_number - 1];
  const sarga_info = kanda_info.sarga_data[sarga_number - 1];
  const response = await generateObject({
    model: {
      'gpt-4o': openai_text_model('gpt-4o')
    }['gpt-4o'],
    messages: [
      {
        role: 'user',
        // content:
        //   `I will be providing you with Sanskrit shlokas of Valmiki Ramayana for the sarga ${sarga_number} kanda ${kANDa_number}.` +
        //   `\nGenerate a 5 line summary(synopsis) of the sarga in English. Keep the summary consistent. ` +
        //   `Use vocabulary which is generally used while translating Ramayana and other such Hindu religious (dharmic) texts to English.` +
        //   `Keep the language simple, don’t use jargon.\n` +
        content:
          `I will be providing you with Sanskrit shlokas of Valmiki Ramayana for the sarga ${sarga_number} kanda ${kANDa_number}.` +
          `Generate a summary of the entire sarga within 7 simple sentences. Cover all key aspects of the story.` +
          `Keep the sentences short and simple. Do not use jargon.` +
          `Give a short English title to the events of this sarga.` +
          `Also translate the sarga name ${sarga_info.name_normal} to English.` +
          `\n\n\n` +
          data.join('\n\n')
      }
    ],
    schema: z.object({
      chapter_name_english: z.string().describe('Translated Chapter name in English'),
      summary_text: z.string()
    })
  });
  if (!fs.existsSync(`summaries/${kANDa_number}`)) fs.mkdirSync(`summaries/${kANDa_number}`);
  const { summary_text, chapter_name_english } = response.object;

  fs.writeFileSync(
    `summaries/${kANDa_number}/${sarga_number}.md`,
    `### ${sarga_info.name_devanagari} (${sarga_info.name_normal})\n` +
      `**Chapter Title** : ${chapter_name_english}` +
      `\n\n${summary_text}`
  );
  console.log(chalk.green(`Summary generated for sarga ${sarga_number}, kANDa ${kANDa_number}`));
};

const generate_readme = () => {
  let readme = '';
  for (let kanda = 1; kanda <= 7; kanda++) {
    const kanda_info = rAmAyanam_map[kanda - 1];
    const sarga_data = kanda_info.sarga_data;
    const sarga_list =
      `<h3><b><a href="./${kanda}.md">पूर्णम्<a/></b></h3>\n` +
      sarga_data
        .map((sarga_info) => {
          return `<li><a href="./${kanda}/${sarga_info.index}.md">${sarga_info.name_devanagari}</a></li>`;
        })
        .join('\n');
    readme += `<details>
<summary><b>${kanda_info.name_devanagari.replaceAll('\n', ' ')}</b></summary>
<ol>
${sarga_list}
</ol>
</details>
`;
  }
  fs.writeFileSync('summaries/README.md', readme);
};

const generate_complete_list = (kanda_num: number) => {
  const kanda_info = rAmAyanam_map[kanda_num - 1];
  let o_file = '';
  for (let i = 1; i <= kanda_info.sarga_data.length; i++) {
    if (!fs.existsSync(`summaries/${kanda_num}/${i}.md`)) continue;
    const file = fs.readFileSync(`summaries/${kanda_num}/${i}.md`, 'utf-8');
    const title_trans = file.split('\n')[1].split(' : ')[1].trim();
    const summary = file.split('\n').splice(3).join('\n');
    o_file += `### ${i}. ${kanda_info.sarga_data[i - 1].name_devanagari.replaceAll('\n', ' ')} <small>(${title_trans})</small>\n${summary}\n\n------------------------------\n\n`;
  }
  fs.writeFileSync(`summaries/${kanda_num}.md`, o_file);
};

const main = async () => {
  const kanda_number = z.coerce
    .number()
    .int()
    .parse(await take_input('kANDa number: '));
  const sarga_range = (await take_input('sarga number(s): ')).split('-');
  const confirm = async () => {
    const confirm = await take_input(chalk.yellow.bold('Confirm sarga number(s): '));
    if (['yes', 'y'].includes(confirm)) return true;
    return false;
  };
  if (sarga_range.length == 1) {
    const sarga = z.coerce.number().int().parse(sarga_range[0]);
    console.log(chalk.blue.bold(`Generating summary for sarga ${sarga}`));
    if (!(await confirm())) return;
    await generate_summary(kanda_number, sarga);
    generate_complete_list(kanda_number);
  } else if (sarga_range.length == 2) {
    const sarga = z.coerce.number().int().array().parse(sarga_range);
    console.log(chalk.green.bold(`Generating summary for sarga ${sarga[0]} to ${sarga[1]}`));
    if (!(await confirm())) return;
    const BATCH_SIZE = 8;
    for (let i = sarga[0]; i <= sarga[1]; i += BATCH_SIZE) {
      const promises: Promise<void>[] = [];
      const batchEnd = Math.min(i + BATCH_SIZE, sarga[1] + 1);

      for (let j = i; j < batchEnd; j++) {
        promises.push(generate_summary(kanda_number, j));
      }

      await Promise.allSettled(promises);
    }
    generate_complete_list(kanda_number);
  }
  console.log(chalk.green.bold(`Done !!`));
};

main();
generate_readme();
// Array.from({ length: 7 }).forEach((_, i) => generate_complete_list(i + 1));
