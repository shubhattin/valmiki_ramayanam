import type { Config } from 'drizzle-kit';
import { get_db_url } from './src/db/db_utils';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

export default {
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './src/db/migrations',
	dbCredentials: {
		url: get_db_url(process.env)
	}
} satisfies Config;
