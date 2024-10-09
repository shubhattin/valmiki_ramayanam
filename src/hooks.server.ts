import type { Handle } from '@sveltejs/kit';
import { AUTH_ID } from '~/tools/auth_tools';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '~/tools/jwt.server';
import { z } from 'zod';
import { user_info_schema } from '~/api/routers/auth';

//export const handle: Handle = createTRPCHandle({ router, createContext });

// Use this approach to also allow prerendering of static pregenerated pages

const handle_trpc: { func: Handle } = { func: null! };

const set_handle_trpc = async () => {
  // using it in this way to also allow static pregenerated pages
  if (!handle_trpc.func) {
    const { createTRPCHandle } = await import('trpc-sveltekit');
    const { router } = await import('~/api/trpc_router');
    const { createContext } = await import('~/api/context');
    handle_trpc.func = createTRPCHandle({ router, createContext });
  }
};

export const handle: Handle = async ({ event, resolve }) => {
  try {
    // this is for verifying the user's identity and not the authorization
    const id_token = event.cookies.get(AUTH_ID);
    const id_token_payload_schema = z.object({
      user: user_info_schema,
      type: z.literal('login')
    });
    if (id_token) {
      const jwt_data = await jwtVerify(id_token, JWT_SECRET, {
        algorithms: ['HS256']
      });
      const payload = id_token_payload_schema.parse(jwt_data.payload);
      event.locals.user = payload.user;
    }
  } catch {}
  if (event.url.pathname.startsWith('/trpc')) {
    await set_handle_trpc();
    return handle_trpc.func({ event, resolve });
  }
  return resolve(event);
};
