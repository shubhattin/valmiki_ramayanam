import { publicProcedure, t } from '@api/trpc_init';
import { z } from 'zod';
import { JWT_SECRET } from '@tools/jwt.server';
import { jwtVerify, SignJWT } from 'jose';
import { puShTi } from '@tools/hash';
import { UsersSchemaZod } from '@db/schema_zod';
import { db } from '@db/db';

const user_info_schema = UsersSchemaZod.pick({
  user_id: true,
  user_name: true,
  user_type: true
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
  const access_token = await new SignJWT({ user: user_info, type: 'api' })
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
      user_type: user_info.user_type
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

// async function check_user_already_exist(username: string) {
//   const data_parse = user_info_schema.safeParse(await base_get(USERS_INFO_DRIVE_LOC, username));
//   if (data_parse.success) return true;
//   return false;
// }

// const add_new_user_route = publicProcedure
//   .input(
//     z.object({
//       username: z.string(),
//       password: z.string(),
//       email: z.string().email()
//     })
//   )
//   .output(
//     z.object({
//       success: z.boolean(),
//       status_code: get_zod_key_enum(dattStruct.drive.login.new_user.msg_codes)
//     })
//   )
//   .mutation(async ({ input: { username, password, email } }) => {
//     let success = false;
//     if (await check_user_already_exist(username))
//       return { success, status_code: 'user_already_exist' };

//     // storing hashed_email
//     const slt = gen_salt();
//     const hashed_email = (await hash_256(email + slt)) + slt;

//     // storing hashed_password
//     const hashed_password = await bcrypt.hash(password, await bcrypt.genSalt());

//     // encryption key :- a 32 byte random value
//     const encrypt_key = crypto.randomBytes(32).toString('base64');

//     await base_put(USERS_INFO_DRIVE_LOC, [
//       {
//         key: username,
//         email_hash: hashed_email,
//         password: hashed_password,
//         encrypt_key
//       }
//     ]);

//     success = true;

//     return { success, status_code: 'success_detail' };
//   });

// const reset_pass_route = publicProcedure
//   .input(
//     z.object({
//       id: z.string(),
//       email: z.string(),
//       newPass: z.string()
//     })
//   )
//   .output(
//     z.object({
//       success: z.boolean(),
//       status_code: get_zod_key_enum(dattStruct.drive.login.reset.msg_codes)
//     })
//   )
//   .mutation(async ({ input: { id, email, newPass } }) => {
//     let success = false;
//     const user_info_parse = user_info_schema.safeParse(await base_get(USERS_INFO_DRIVE_LOC, id));
//     if (!user_info_parse.success) return { success, status_code: 'user_not_found' };
//     const user_info = user_info_parse.data;

//     // verifying email
//     const verified_email = await puShTi(email, user_info.email_hash);
//     (await base_get<{ key: string; value: string }>(`${USERS_INFO_DRIVE_LOC}_email`, id))?.value!;
//     if (!verified_email) return { success, status_code: 'wrong_email' };

//     // storing new password
//     const hashed_password = await bcrypt.hash(newPass, await bcrypt.genSalt());
//     base_put<user_info_type>(USERS_INFO_DRIVE_LOC, [{ ...user_info, password: hashed_password }]);
//     success = true;

//     return { success, status_code: 'success_detail' };
//   });

export const auth_router = t.router({
  verify_pass: verify_pass_router,
  renew_access_token: renew_access_token
  // add_new_user: add_new_user_route,
  // reset_pass: reset_pass_route
});
