import * as fs from 'fs';
import { z } from 'zod';
import { dbClient_ext as db, queryClient } from '~/db/scripts/client';
import { execSync } from 'child_process';

const OUT_FOLDER = './backup';

async function main() {
  if (!fs.existsSync(OUT_FOLDER)) fs.mkdirSync(OUT_FOLDER);

  const envs_parsed = z
    .object({
      PG_DATABASE_URL: z.string(),
      BACKUP_ENCRYPTION_KEY: z.string()
    })
    .safeParse(process.env);
  if (!envs_parsed.success) {
    console.error(envs_parsed.error);
    return;
  }
  const envs = envs_parsed.data;

  const trans_data = {
    translations: await db.query.translations.findMany()
  };
  const JSON_TRANS_DATA_FILE = `${OUT_FOLDER}/translations.json`;
  fs.writeFileSync(JSON_TRANS_DATA_FILE, JSON.stringify(trans_data, null, 2));

  if (!process.argv.slice(2).includes('--only-trans')) {
    // Encrypting User Data
    const user_data = {
      user_verification_requests: await db.query.user_verification_requests.findMany(),
      users: await db.query.users.findMany()
    };
    const JSON_USER_DATA_FILE = `${OUT_FOLDER}/user_data.json`;
    fs.writeFileSync(JSON_USER_DATA_FILE, JSON.stringify(user_data, null, 2), {
      encoding: 'utf-8'
    });

    // Backup using pg_dump
    execSync(
      `pg_dump --dbname=${envs.PG_DATABASE_URL} --if-exists --clean --insert --no-owner --rows-per-insert=8000 -f b.sql`
    );
    const backup_file_data = fs.readFileSync('b.sql').toString('utf-8');
    fs.writeFileSync(`${OUT_FOLDER}/db_dump.sql`, backup_file_data, {
      encoding: 'utf-8'
    });
    fs.rmSync('b.sql');

    // Zipping files
    execSync(
      `cd backup && zip -P ${envs.BACKUP_ENCRYPTION_KEY}  encrypted.zip db_dump.sql user_data.json && rm db_dump.sql user_data.json`
    );
  }
}

main().then(() => queryClient.end());
