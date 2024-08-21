import { setCookie, getCookie, getTime, deleteCookie } from '@tools/cookies';
import { from_base64 } from '@tools/kry';
import { z } from 'zod';
import { client, setAccessToken } from '@api/client';

export const ID_TOKEN_INFO_SCHEMA = z.object({
  id: z.number().int(),
  user_name: z.string(),
  user_id: z.string(),
  user_type: z.enum(['admin', 'non-admin'])
});

// not reading this directly from `schema_zod` as it would include drizzle-orm bundle on fromntend
const ACCRSS_TOKEN_INFO_SCHEMA = ID_TOKEN_INFO_SCHEMA.pick({
  id: true,
  user_type: true
});

export const AUTH_ID = 'drive_auth_id'; // id token
export const ACCESS_ID = 'drive_access_id';
export const COOKIE_LOC = '/';

export interface authRes {
  id_token: string;
  access_token: string;
}
export const storeAuthInfo = (res: authRes) => {
  localStorage.setItem(ACCESS_ID, res.access_token);
  setCookie(AUTH_ID, res.id_token, get_access_token_info().exp, COOKIE_LOC);
  setAccessToken(res.access_token);
};

const JWT_HEADER_SCHEMA = z.object({
  alg: z.literal('HS256')
});

export const get_id_token_info = () => {
  const cookie = getCookie(AUTH_ID);

  // header parsing :- not returning it as it typically not required, but verifying it to be more sure of the integrity of the token
  JWT_HEADER_SCHEMA.parse(JSON.parse(from_base64(cookie.split('.')[0])));

  const payload = z
    .object({
      user: ID_TOKEN_INFO_SCHEMA,
      type: z.literal('login'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(JSON.parse(from_base64(cookie.split('.')[1])));
  if (payload.exp - getTime() <= 0) throw new Error('expired');
  return payload;
};

export const get_access_token_info = () => {
  const cookie = localStorage.getItem(ACCESS_ID)!;

  // header parsing :- not returning it as it typically not required, but verifying it to be more sure of the integrity of the token
  JWT_HEADER_SCHEMA.parse(JSON.parse(from_base64(cookie.split('.')[0])));

  const payload = z
    .object({
      user: ACCRSS_TOKEN_INFO_SCHEMA,
      type: z.literal('api'),
      iat: z.number().int(),
      exp: z.number().int()
    })
    .parse(JSON.parse(from_base64(cookie.split('.')[1])));
  if (payload.exp - getTime() <= 0) throw new Error('expired');
  return payload;
};

/**
 * This functions should run on startup or before any api call
 * It looks for valid tokens and if not found takes necessary actions
 * for id token if not found or expired then delete.
 * for access token if expired then renew.
 */
export const ensure_auth_access_status = async () => {
  try {
    get_id_token_info();
  } catch {
    deleteAuthCookies();
    // TODO
    // if on user_manage page, redirect to home page
    return;
  }

  // renewing our tokens if access token is expired
  try {
    get_access_token_info();
    setAccessToken(localStorage.getItem(ACCESS_ID)!);
  } catch (e: any) {
    if (e instanceof Error) {
      if (e.message === 'expired') await renew_tokens_after_access_expire();
    }
  }
};

export const deleteAuthCookies = () => {
  deleteCookie(AUTH_ID, COOKIE_LOC);
  localStorage.removeItem(ACCESS_ID);
  setAccessToken('');
};

export async function renew_tokens_after_access_expire() {
  const res = await client.auth.renew_access_token.query({
    id_token: getCookie(AUTH_ID)!
  });
  if (!res.verified) return;
  storeAuthInfo(res);
  setAccessToken(res.access_token);
}
