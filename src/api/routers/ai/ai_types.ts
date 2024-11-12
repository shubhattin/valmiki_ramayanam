import { z } from 'zod';

export const translation_out_schema = z
  .object({
    text: z.string().describe('The trnalstion text'),
    shloka_num: z
      .number()
      .describe('The index of shlokas to be generated, use 0 for starting and -1 for ending.')
  })
  .array()
  .describe('This array will contain the text and the index of the shlokas to be generated.');

export const sarga_translate_schema = {
  input: z.object({
    lang: z.string(),
    messages: z
      .object({
        role: z.union([z.literal('user'), z.literal('assistant')]),
        content: z.string()
      })
      .array()
  }),
  output: z.union([
    z.object({ success: z.literal(true), translations: translation_out_schema }),
    z.object({ success: z.literal(false) })
  ])
};
