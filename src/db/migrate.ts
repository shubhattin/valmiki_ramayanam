import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { get_db_url } from './db_utils';

dotenv.config({ path: '../../.env.local' });

export const migrationClient = postgres(get_db_url(process.env), { max: 1 });

// This will run migrations on the database, skipping the ones already applied
await migrate(drizzle(migrationClient), { migrationsFolder: './migrations' });
console.log('Migration Done.');

await migrationClient.end();
