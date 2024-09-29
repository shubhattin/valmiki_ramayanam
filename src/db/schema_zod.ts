import { createSelectSchema } from 'drizzle-zod';
import { users, translations, user_verification_requests } from './schema';

export const UsersSchemaZod = createSelectSchema(users);
export const TranslationsSchemaZod = createSelectSchema(translations);
export const UserVerificationRequestsSchemaZod = createSelectSchema(user_verification_requests);
