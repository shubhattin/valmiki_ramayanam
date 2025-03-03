import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';
import ky from 'ky';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

const sessionSchema = z.object({
  session: z.object({
    ipAddress: z.string(),
    userAgent: z.string(),
    expiresAt: z.string(),
    userId: z.string(),
    token: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    role: z.string().nullable(),
    banned: z.string().nullable(),
    banReason: z.string().nullable(),
    banExpires: z.string().nullable()
  })
});

export async function createContext(event: RequestEvent) {
  const { request } = event;

  const get_seesion = async () => {
    try {
      const session = sessionSchema.parse(
        await ky
          .get(`${PUBLIC_BETTER_AUTH_URL}/api/auth/get-session`, {
            headers: {
              Cookie: request.headers.get('Cookie')!
            }
          })
          .json()
      );
      return session;
    } catch (e) {
      return null;
    }
  };
  const session = await get_seesion();

  const user = session?.user;
  return {
    user
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
