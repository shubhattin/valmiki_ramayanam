import { z } from 'zod';

export const translation_out_schema = z
  .object({
    text: z.string().describe('The translation text'),
    shloka_num: z
      .number()
      .describe('The index of shlokas to be generated, use 0 for starting and -1 for ending.')
  })
  .describe(
    'This object will contain the translated text and the index of the shloka to be generated.'
  );

export const text_models_enum = z.enum(['gpt-4o', 'claude-3.5-sonnet', 'o3-mini']);

export const sarga_translate_schema = {
  input: z.object({
    lang_id: z.number().int(),
    model: text_models_enum,
    messages: z
      .object({
        role: z.union([z.literal('user'), z.literal('assistant')]),
        content: z.string()
      })
      .array()
  }),
  output: z.union([
    z.object({ success: z.literal(true), translations: translation_out_schema.array() }),
    z.object({ success: z.literal(false) })
  ])
};
