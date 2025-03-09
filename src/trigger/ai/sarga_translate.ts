import { task } from '@trigger.dev/sdk/v3';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { sarga_translate_schema, translation_out_schema } from '~/api/routers/ai/ai_types';

const openai_text_model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic_text_model = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const translate_sarga = task({
  id: 'ai_translate_sarga',
  maxDuration: 12 * 60, // 12 minutes
  run: async (payload: z.infer<typeof sarga_translate_schema.input>) => {
    payload = sarga_translate_schema.input.parse(payload);
    const { messages, model } = payload;

    try {
      const response = await generateObject({
        model: {
          'gpt-4o': openai_text_model('o3-mini'),
          'claude-3.7-sonnet': anthropic_text_model('claude-3-7-sonnet-latest'),
          'o3-mini': openai_text_model('o3-mini')
        }[model],
        messages,
        output: 'array',
        schema: translation_out_schema,
        schemaDescription:
          'This should be an array of objects, each object containing the translation text and the index of the shloka to be generated.',
        schemaName: 'ai_translations_text_schema'
      });
      return { translations: response.object, success: true };
    } catch (e) {
      console.log(e);
      return { success: false };
    }
  }
});
