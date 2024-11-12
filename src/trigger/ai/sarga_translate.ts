import { task } from '@trigger.dev/sdk/v3';
import { generateObject } from 'ai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { sarga_translate_schema, translation_out_schema } from '~/api/routers/ai/ai_types';

const openai_text_model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const translate_sarga = task({
  id: 'ai_translate_sarga',
  maxDuration: 300, // in seconds
  run: async (payload: z.infer<typeof sarga_translate_schema.input>) => {
    payload = sarga_translate_schema.input.parse(payload);
    const { messages } = payload;

    try {
      const response = await generateObject({
        model: openai_text_model('gpt-4o'),
        messages,
        schema: z.object({ translations: translation_out_schema })
      });
      return { ...response.object, success: true };
    } catch {
      return { success: false };
    }
  }
});
