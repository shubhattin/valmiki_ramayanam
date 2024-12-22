import { eq } from 'drizzle-orm';
import { bcrypt } from 'hash-wasm';
import { z } from 'zod';
import { protectedAdminProcedure, publicProcedure, t } from '~/api/trpc_init';
import { db } from '~/db/db';
import { user_verification_requests, users } from '~/db/schema';
import { delay } from '~/tools/delay';
import { cleanUpWhitespace, get_randon_number } from '~/tools/kry';
import type { lang_list_type } from '~/tools/lang_list';
import { bcrypt_hash } from './_auth_security';

const add_new_user_route = publicProcedure
  .input(
    z.object({
      username: z.string(),
      name: z.string(),
      password: z.string(),
      email: z.string().email(),
      contact_number: z.string().nullable()
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      status_code: z.enum(['user_already_exist', 'email_already_exist', 'success'])
    })
  )
  .mutation(async ({ input: { username, password, email, name, contact_number } }) => {
    let success = false;
    await delay(500);
    if (await db.query.users.findFirst({ where: ({ user_id }, { eq }) => eq(user_id, username) }))
      return { success, status_code: 'user_already_exist' };
    if (
      await db.query.users.findFirst({ where: ({ user_email }, { eq }) => eq(user_email, email) })
    )
      return { success, status_code: 'email_already_exist' };

    // hashing password
    const hashed_password = await bcrypt_hash(password);

    username = cleanUpWhitespace(username);
    name = cleanUpWhitespace(name);
    email = cleanUpWhitespace(email);
    const returning_data = await db
      .insert(users)
      .values({
        user_id: username,
        user_name: name,
        user_email: email,
        password_hash: hashed_password,
        contact_number: contact_number
      })
      .returning();
    // user_type -> default non-admin
    // we can be sure that if the insert is success then only it will
    // proceed else throw a error into trpc and quit
    const id = returning_data[0].id;
    await db.insert(user_verification_requests).values({
      id: id,
      otp: get_randon_number(1000, 9999).toString()
    });
    success = true;
    return { success, status_code: 'success' };
  });

const verify_user_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int() }))
  .mutation(async ({ input: { id } }) => {
    await db.delete(user_verification_requests).where(eq(user_verification_requests.id, id));
  });

const delete_unverified_user_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int() }))
  .mutation(async ({ input: { id } }) => {
    await db.delete(users).where(eq(users.id, id));
  });

const update_user_allowed_langs_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int(), langs: z.string().array() }))
  .mutation(async ({ input: { id, langs } }) => {
    const langs_type = langs as lang_list_type[];
    await db.update(users).set({ allowed_langs: langs_type }).where(eq(users.id, id));
  });

export const user_router = t.router({
  add_new_user: add_new_user_route,
  verify_unverified_user: verify_user_route,
  delete_unverified_user: delete_unverified_user_route,
  add_user_allowed_langs: update_user_allowed_langs_route
});
