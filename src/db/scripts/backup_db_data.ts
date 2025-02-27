import * as fs from 'fs';
import { z } from 'zod';
import { dbClient_ext as db, queryClient } from '~/db/scripts/client';
import { execSync } from 'child_process';
import { json2csv } from 'json-2-csv';

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
  const csv = json2csv(trans_data.translations);
  fs.writeFileSync(`${OUT_FOLDER}/translations.csv`, csv);

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
    function backup(command: string, file_name: string, temp_file_name: string) {
      execSync(command);
      const backup_file_data = fs.readFileSync(temp_file_name).toString('utf-8');
      fs.writeFileSync(`${OUT_FOLDER}/${file_name}`, backup_file_data, {
        encoding: 'utf-8'
      });
      fs.rmSync(temp_file_name);
    }

    // Backup using pg_dump
    backup(
      `pg_dump --dbname=${envs.PG_DATABASE_URL} --if-exists --schema-only --clean --no-owner -f b.sql`,
      'db_dump_schema.sql',
      'b.sql'
    );
    backup(
      `pg_dump --dbname=${envs.PG_DATABASE_URL} --data-only --insert --no-owner --rows-per-insert=8000 -f b.sql`,
      'db_dump_data.sql',
      'b.sql'
    );

    // Zipping files
    execSync(
      `cd backup && zip -P ${envs.BACKUP_ENCRYPTION_KEY}  encrypted.zip db_dump_data.sql db_dump_schema.sql user_data.json && rm db_dump_data.sql db_dump_schema.sql user_data.json`
    );
  }
}

main().then(() => queryClient.end());
