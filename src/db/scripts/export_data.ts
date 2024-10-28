import { dbClient_ext as db, queryClient } from './client';
import { readFile } from 'fs/promises';
import { dbMode, take_input } from '~/tools/kry.server';
import { translations, user_verification_requests, users } from '~/db/schema';
import {
  UsersSchemaZod,
  TranslationsSchemaZod,
  UserVerificationRequestsSchemaZod
} from '~/db/schema_zod';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

const main = async () => {
  /*
   Better backup & restore tools like `pg_dump` and `pg_restore` should be used.
  
   Although Here the foriegn key relations are not that complex so we are doing it manually
  */
  if (!(await confirm_environemnt())) return;

  console.log(`Insering Data into ${dbMode} Database...`);

  const in_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];

  const data = z
    .object({
      users: UsersSchemaZod.array(),
      translations: TranslationsSchemaZod.array(),
      user_verification_requests: UserVerificationRequestsSchemaZod.array()
    })
    .parse(JSON.parse((await readFile(`./out/${in_file_name}`)).toString()));

  // insertig users
  try {
    await db.delete(users);
    // @ts-ignore
    await db.insert(users).values(data.users);
    // resetting the SERIAL
    await db.execute(sql`SELECT setval('users_id_seq', (select MAX(id) from users))`);
    console.log('Successfully added values into table `users`');
  } catch {}

  // insertig user_verification_requests
  try {
    await db.delete(user_verification_requests);
    await db.insert(user_verification_requests).values(data.user_verification_requests);
    // resetting the SERIAL
    await db.execute(
      sql`SELECT setval('user_verification_requests_id_seq', (select MAX(id) from user_verification_requests))`
    );
    console.log('Successfully added values into table `user_verification_requests`');
  } catch {}

  // insertig translations
  try {
    await db.delete(translations);
    await db.insert(translations).values(data.translations);
    console.log('Successfully added values into table `translations`');
  } catch {}
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure INSERT in ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
