import * as fs from 'fs';
import { z } from 'zod';
import { dbClient_ext as db, queryClient } from '~/db/scripts/client';
import { encrypt_text } from '~/tools/encrypt_decrypt';
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

  // Encrypting User Data
  const user_data = {
    user_verification_requests: await db.query.user_verification_requests.findMany(),
    users: await db.query.users.findMany()
  };
  const JSON_USER_DATA_FILE = `${OUT_FOLDER}/user_data_json_encrypted`;
  fs.writeFileSync(
    JSON_USER_DATA_FILE,
    await encrypt_text(JSON.stringify(user_data, null, 2), envs.BACKUP_ENCRYPTION_KEY)
  );

  // Backup using pg_dump
  execSync(
    `pg_dump --dbname=${envs.PG_DATABASE_URL} --if-exists --clean --insert --no-owner --rows-per-insert=8000 -f b.sql`
  );
  const backup_file_data = fs.readFileSync('b.sql').toString('utf-8');
  fs.writeFileSync(
    `${OUT_FOLDER}/db_dump_sql_encrypted`,
    await encrypt_text(backup_file_data, envs.BACKUP_ENCRYPTION_KEY),
    {
      encoding: 'utf-8'
    }
  );
  fs.rmSync('b.sql');
}

main().then(() => queryClient.end());
