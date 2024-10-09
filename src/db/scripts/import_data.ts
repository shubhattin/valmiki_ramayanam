import { dbClient_ext as db, queryClient } from './client';
import { writeFile } from 'fs/promises';
import { dbMode, make_dir, take_input } from '~/tools/kry_server';

const main = async () => {
  if (!(await confirm_environemnt())) return;

  console.log(`Fetching Data from ${dbMode} Database...`);

  const translations = await db.query.translations.findMany();
  const user_verification_requests = await db.query.user_verification_requests.findMany();
  const users = await db.query.users.findMany();

  const json_data = {
    translations,
    user_verification_requests,
    users
  };

  make_dir('./out');
  const out_file_name = {
    PROD: 'db_data_prod.json',
    PREVIEW: 'db_data_preview.json',
    LOCAL: 'db_data.json'
  }[dbMode];
  await writeFile(`./out/${out_file_name}`, JSON.stringify(json_data, null, 2));
};
main().then(() => {
  queryClient.end();
});

async function confirm_environemnt() {
  let confirmation: string = await take_input(`Are you sure SELECT from ${dbMode} ? `);
  if (['yes', 'y'].includes(confirmation)) return true;
  return false;
}
