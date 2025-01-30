import { generateObject } from 'ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import { createOpenAI } from '@ai-sdk/openai';
import * as fs from 'fs';

dotenv.config({
  path: '../../../.env.local'
});

const openai_text_model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generate_summary = async (kANDa_number: number, sarga_number: number) => {
  if (!fs.existsSync('summaries')) fs.mkdirSync('summaries');
  const data: string[] = JSON.parse(
    fs.readFileSync(`../data/${kANDa_number}/${sarga_number}.json`, 'utf-8')
  );
  const response = await generateObject({
    model: {
      'gpt-4o': openai_text_model('gpt-4o')
    }['gpt-4o'],
    messages: [
      {
        role: 'user',
        content:
          `I will be providing you with Sanskrit shlokas of Valmiki Ramayana for the sarga ${sarga_number} kanda ${kANDa_number}.` +
          `\nGenerate a summary synopsis in points of the sarga in English. Keep the summary consistent. Use vocabulary which is generally used while translating Ramayana and other such Hindu religious (dharmic) texts to English.` +
          `\n\n\n` +
          data.join('\n\n')
      }
    ],
    schema: z.object({
      summary_text: z.string()
    })
  });
  if (!fs.existsSync(`summaries/${kANDa_number}`)) fs.mkdirSync(`summaries/${kANDa_number}`);
  fs.writeFileSync(`summaries/${kANDa_number}/${sarga_number}.md`, response.object.summary_text);
};

generate_summary(2, 1);
