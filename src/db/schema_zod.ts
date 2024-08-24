import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

export const UsersSchemaZod = createSelectSchema(users);
