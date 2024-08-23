import { publicProcedure, t } from '@api/trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '@tools/jwt.server';
import { jwtVerify, SignJWT } from 'jose';
import { puShTi, gen_salt, hash_256 } from '@tools/hash';
import { UsersSchemaZod } from '@db/schema_zod';
import { db } from '@db/db';
import { user_verification_requests, users } from '@db/schema';

const user_info_schema = UsersSchemaZod.pick({
  user_id: true,
  user_name: true,
  user_type: true,
  id: true
});
type user_info_type = z.infer<typeof user_info_schema>;

const ID_TOKREN_EXPIRE = '15d';
const ACCESS_TOKEN_EXPIRE = '5h';

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

const verify_pass_router = publicProcedure
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
  .query(async ({ input: { password, username_or_email } }) => {
    let verified = false;

    const user_info = await db.query.users.findFirst({
      where: ({ user_id, user_email }, { eq, or }) =>
        or(eq(user_id, username_or_email), eq(user_email, username_or_email))
    });
    if (!user_info) return { verified, err_code: 'user_not_found' };

    verified = await puShTi(password, user_info.password_hash);
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

const renew_access_token = publicProcedure
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

const add_new_user_route = publicProcedure
  .input(
    z.object({
      username: z.string(),
      name: z.string(),
      password: z.string(),
      email: z.string().email(),
      contact_number: z.string().optional()
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
    if (await db.query.users.findFirst({ where: ({ user_id }, { eq }) => eq(user_id, username) }))
      return { success, status_code: 'user_already_exist' };
    if (
      await db.query.users.findFirst({ where: ({ user_email }, { eq }) => eq(user_email, email) })
    )
      return { success, status_code: 'email_already_exist' };

    // hashing password
    const slt = gen_salt();
    const hashed_password = (await hash_256(password + slt)) + slt;

    await db.transaction(async (tx) => {
      const returning_data = await tx
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
      await tx.insert(user_verification_requests).values({
        id: id
      });
    });
    success = true;
    return { success, status_code: 'success' };
  });

export const auth_router = t.router({
  verify_pass: verify_pass_router,
  renew_access_token: renew_access_token,
  add_new_user: add_new_user_route
});
