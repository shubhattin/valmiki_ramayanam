import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { protectedAdminProcedure, protectedProcedure, publicProcedure, t } from '~/api/trpc_init';
import { db } from '~/db/db';
import { user_verification_requests, users } from '~/db/schema';
import { delay } from '~/tools/delay';
import { cleanUpWhitespace, get_randon_number } from '~/tools/kry';
import type { lang_list_type } from '~/tools/lang_list';
import { bcrypt_hash, send_email_verify_otp } from './_auth_security';
import { send_email } from '~/tools/email';
import { env } from '$env/dynamic/private';

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
    z.discriminatedUnion('success', [
      z.object({
        success: z.literal(false),
        status_code: z.enum(['user_already_exist', 'email_already_exist'])
      }),
      z.object({
        success: z.literal(true),
        status_code: z.literal('success'),
        user_id: z.number().int()
      })
    ])
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

    const otp = get_randon_number(1000, 9999).toString();
    const email_verify_prom = send_email_verify_otp(email, otp);
    // user_type -> default non-admin
    // we can be sure that if the insert is success then only it will
    // proceed else throw a error into trpc and quit
    const id = returning_data[0].id;

    await Promise.all([
      await db.insert(user_verification_requests).values({
        id: id,
        otp: otp
      }),
      email_verify_prom
    ]);
    success = true;
    return { success, status_code: 'success', user_id: id };
  });

const verify_user_email_route = publicProcedure
  .input(z.object({ otp: z.string().length(4), id: z.number().int() }))
  .mutation(async ({ input: { otp, id } }) => {
    await delay(500);
    const user_otp = (await db.query.users.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id),
      columns: {
        id: true
      },
      with: {
        user_verification_requests: {
          columns: {
            otp: true
          }
        }
      }
    }))!;
    if (user_otp.user_verification_requests?.otp === otp) {
      await db
        .update(user_verification_requests)
        .set({ email_verified: true })
        .where(eq(user_verification_requests.id, id));
      return { verified: true };
    }
    return { verified: false };
  });

const verify_user_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int() }))
  .mutation(async ({ input: { id } }) => {
    const user_info = (await db.query.users.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id),
      columns: {
        id: true,
        user_email: true
      },
      with: {
        user_verification_requests: {
          columns: {
            email_verified: true
          }
        }
      }
    }))!;
    const email = user_info.user_email;
    const email_verified = user_info.user_verification_requests!.email_verified;

    if (email_verified) {
      await Promise.all([
        await db.delete(user_verification_requests).where(eq(user_verification_requests.id, id)),
        await send_email({
          recipient_emails: [email],
          senders_name: env.EMAIL_SENDER_NAME!,
          subject: 'Your Account has been Approved',
          html: `Your Account has been approved by the Admin for the Valmiki Ramayanam Project. <i>Your Effort, Time and Contributions are very much appreciated</i>.<br/><br/><b>Praṇāma</b>`
        })
      ]);
    }
  });

const delete_unverified_user_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int() }))
  .mutation(async ({ input: { id } }) => {
    await db.delete(users).where(eq(users.id, id));
  });

const update_user_allowed_langs_route = protectedAdminProcedure
  .input(z.object({ id: z.number().int(), langs: z.string().array() }))
  .mutation(async ({ input: { id, langs } }) => {
    const email = (await db.query.users.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id),
      columns: {
        user_email: true
      }
    }))!.user_email;

    const langs_allowed = langs as lang_list_type[];
    await Promise.all([
      await db.update(users).set({ allowed_langs: langs_allowed }).where(eq(users.id, id)),
      langs_allowed.length > 0 &&
        (await send_email({
          recipient_emails: [email],
          senders_name: env.EMAIL_SENDER_NAME!,
          subject: 'Translation Language Alloted for Contribution',
          html:
            `Now you can contribute to the Valmiki Ramayanam Translations for the following languages: <b>${langs_allowed.join(', ')}</b><br/>` +
            '<i>Your Contributions to the Project are Appreciated.</i><br/><br/><b>Praṇāma</b>'
        }))
    ]);
  });

const send_user_email_verify_otp_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  const email = (await db.query.users.findFirst({
    where: (tbl, { eq }) => eq(tbl.id, user.id),
    columns: {
      user_email: true
    }
  }))!.user_email;

  const otp = get_randon_number(1000, 9999).toString();
  await Promise.all([
    await send_email_verify_otp(email, otp),
    await db
      .update(user_verification_requests)
      .set({ otp: otp })
      .where(eq(user_verification_requests.id, user.id))
  ]);
});

const correct_unverified_user_email_route = protectedProcedure
  .input(z.object({ new_email: z.string().email() }))
  .output(
    z.object({
      success: z.boolean(),
      status_code: z.enum(['email_not_unverified', 'email_already_exists', 'email_updated'])
    })
  )
  .mutation(async ({ input: { new_email }, ctx: { user } }) => {
    let success = false;
    await delay(700);
    const user_info = (await db.query.users.findFirst({
      where: ({ id }, { eq }) => eq(id, user.id),
      columns: {},
      with: {
        user_verification_requests: {
          columns: {
            email_verified: true
          }
        }
      }
    }))!;
    if (
      !user_info.user_verification_requests ||
      user_info.user_verification_requests.email_verified
    )
      return {
        success,
        status_code: 'email_not_unverified'
      };

    const new_email_exists = await db.query.users.findFirst({
      where: ({ user_email }, { eq }) => eq(user_email, new_email),
      columns: {
        id: true
      }
    });
    if (new_email_exists)
      return {
        success,
        status_code: 'email_already_exists'
      };

    await db.update(users).set({ user_email: new_email }).where(eq(users.id, user.id));
    success = true;
    return {
      success,
      status_code: 'email_updated'
    };
  });

export const user_router = t.router({
  add_new_user: add_new_user_route,
  admin_controls: t.router({
    verify_unverified_user: verify_user_route,
    delete_unverified_user: delete_unverified_user_route,
    add_user_allowed_langs: update_user_allowed_langs_route
  }),
  email_verification: t.router({
    send_user_email_verify_otp: send_user_email_verify_otp_route,
    verify_user_email: verify_user_email_route,
    correct_unverified_user_email: correct_unverified_user_email_route
  })
});
