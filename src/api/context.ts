import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import ky from 'ky';
import type { authClient } from '$lib/auth-client';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

export const get_seesion_from_cookie = async (cookie: string) => {
  try {
    const session = await ky
      .get<typeof authClient.$Infer.Session>(`${PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`, {
        headers: {
          Cookie: cookie
        }
      })
      .json();
    return session;
  } catch (e) {
    return null;
  }
};
export async function createContext(event: RequestEvent) {
  const { request } = event;

  const cookie = request.headers.get('Cookie');
  const session = await get_seesion_from_cookie(cookie!);

  const user = session?.user;
  return {
    user,
    cookie
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
