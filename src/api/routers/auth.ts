import { protectedProcedure, publicProcedure, t } from '~/api/trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '~/tools/jwt.server';
import { jwtVerify, SignJWT } from 'jose';
import { UsersSchemaZod } from '~/db/schema_zod';
import { db } from '~/db/db';
import { forgot_pass_otp, users } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { delay } from '~/tools/delay';
import { bcrypt_hash, bcrypt_verify } from './_auth_security';
import { get_randon_number, mask_email } from '~/tools/kry';
import { send_email } from '~/tools/email';
import { env } from '$env/dynamic/private';

export const user_info_schema = UsersSchemaZod.pick({
  user_id: true,
  user_name: true,
  user_type: true,
  id: true
});
type user_info_type = z.infer<typeof user_info_schema>;

const ID_TOKREN_EXPIRE = '30d';
const ACCESS_TOKEN_EXPIRE = '16h';

const get_id_and_aceess_token = async (user_info: user_info_type) => {
  // ID Token will be used for authentication, i.e. to verify the user's identity.
  // in our case will also act as refresh tokens
  const id_token = await new SignJWT({ user: user_info, type: 'login' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ID_TOKREN_EXPIRE)
    .sign(JWT_SECRET);

  // Access Token will be used for authorization, i.e. to access the user's resources.
  const access_token = await new SignJWT({
    user: {
      id: user_info.id,
      user_type: user_info.user_type
    },
    type: 'api'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRE)
    .sign(JWT_SECRET);

  return {
    id_token,
    access_token
  };
};

const verify_pass_route = publicProcedure
  .input(
    z.object({
      username_or_email: z.string(),
      password: z.string()
    })
  )
  .output(
    z.union([
      z.object({
        verified: z.literal(false),
        err_code: z.enum(['user_not_found', 'wrong_password'])
      }),
      z.object({
        verified: z.literal(true),
        id_token: z.string(),
        access_token: z.string()
      })
    ])
  )
  .mutation(async ({ input: { password, username_or_email } }) => {
    let verified = false;
    await delay(600);

    const user_info = await db.query.users.findFirst({
      where: ({ user_id, user_email }, { eq, or }) =>
        or(eq(user_id, username_or_email), eq(user_email, username_or_email))
    });
    if (!user_info) return { verified, err_code: 'user_not_found' };

    verified = await bcrypt_verify(password, user_info.password_hash);
    if (!verified) return { verified, err_code: 'wrong_password' };
    const { id_token, access_token } = await get_id_and_aceess_token({
      user_id: user_info.user_id,
      user_name: user_info.user_name,
      user_type: user_info.user_type,
      id: user_info.id
    });
    return {
      verified,
      id_token,
      access_token
    };
  });

const id_token_payload_schema = z.object({
  user: user_info_schema,
  type: z.literal('login')
});

const renew_access_token_route = publicProcedure
  .input(
    z.object({
      id_token: z.string()
    })
  )
  .output(
    z.union([
      z.object({
        verified: z.literal(false)
      }),
      z.object({
        verified: z.literal(true),
        access_token: z.string(),
        id_token: z.string()
      })
    ])
  )
  .query(async ({ input: { id_token } }) => {
    async function get_user_from_id_token() {
      let payload: z.infer<typeof id_token_payload_schema>;
      try {
        payload = id_token_payload_schema.parse((await jwtVerify(id_token, JWT_SECRET)).payload);
        return payload;
      } catch {}
      return null;
    }
    const user = await get_user_from_id_token();
    if (!user)
      return {
        verified: false
      };
    return { verified: true, ...(await get_id_and_aceess_token(user.user)) };
  });

const update_password_route = protectedProcedure
  .input(
    z.object({
      current_password: z.string(),
      new_password: z.string()
    })
  )
  .mutation(async ({ input: { current_password, new_password }, ctx: { user } }) => {
    const user_info = (await db.query.users.findFirst({
      columns: {
        password_hash: true
      },
      where: ({ id }, { eq }) => eq(id, user.id)
    }))!;
    await delay(500);
    const verified = await bcrypt_verify(current_password, user_info.password_hash);
    if (!verified) return { success: false };
    const hashed_password = await bcrypt_hash(new_password);
    await db.update(users).set({ password_hash: hashed_password }).where(eq(users.id, user.id));
    return { success: true };
  });

const send_reset_password_otp_route = publicProcedure
  .input(z.object({ username_or_email: z.string() }))
  .output(
    z.discriminatedUnion('success', [
      z.object({ success: z.literal(false) }),
      z.object({ success: z.literal(true), masked_email: z.string(), user_id: z.number().int() })
    ])
  )
  .mutation(async ({ input: { username_or_email } }) => {
    await delay(600);
    const user_info = await db.query.users.findFirst({
      where: ({ user_email, user_id }, { eq, or }) =>
        or(eq(user_email, username_or_email), eq(user_id, username_or_email)),
      columns: {
        id: true,
        user_email: true
      }
    });
    if (!user_info) return { success: false };
    const otp_exists = await db.query.forgot_pass_otp.findFirst({
      where: ({ id }, { eq }) => eq(id, user_info.id),
      columns: {
        id: true
      }
    });
    const otp = get_randon_number(1000, 9999).toString();
    await Promise.all([
      !otp_exists
        ? await db.insert(forgot_pass_otp).values({
            id: user_info.id,
            otp: otp
          })
        : await db.update(forgot_pass_otp).set({ otp }).where(eq(forgot_pass_otp.id, user_info.id)),
      await send_email({
        recipient_emails: [user_info.user_email],
        senders_name: env.EMAIL_SENDER_NAME,
        subject: 'Reset Password OTP for Valmiki Ramayanam',
        html: `Please reset your password by entering the OTP : <b>${otp}</b> in the reset password page.<br/><br/><b>Praṇāma</b>`
      })
    ]);
    return {
      success: true,
      masked_email: mask_email(user_info.user_email, { startChars: 3, endChars: 2 }),
      user_id: user_info.id
    };
  });

const reset_password_via_otp_route = publicProcedure
  .input(
    z.object({
      id: z.number().int(),
      otp: z.string().length(4),
      new_password: z.string().min(6)
    })
  )
  .mutation(async ({ input: { id, otp, new_password } }) => {
    await delay(550);
    const otp_info = await db.query.forgot_pass_otp.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id)
    });
    if (!otp_info) return { success: false };
    if (otp !== otp_info.otp) return { success: false };
    const hashed_password = await bcrypt_hash(new_password);
    await Promise.all([
      await db.update(users).set({ password_hash: hashed_password }).where(eq(users.id, id)),
      await db.delete(forgot_pass_otp).where(eq(forgot_pass_otp.id, id))
    ]);
    return { success: true };
  });

export const auth_router = t.router({
  verify_pass: verify_pass_route,
  renew_access_token: renew_access_token_route,
  update_password: update_password_route,
  reset_password: t.router({
    send_reset_password_otp: send_reset_password_otp_route,
    reset_password_via_otp: reset_password_via_otp_route
  })
});
