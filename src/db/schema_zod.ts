import { createSelectSchema } from 'drizzle-zod';
import { translations } from './schema';

export const TranslationsSchemaZod = createSelectSchema(translations);
