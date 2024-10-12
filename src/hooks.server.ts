import type { Handle } from '@sveltejs/kit';
import { AUTH_ID } from '~/tools/auth_tools';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '~/tools/jwt.server';
import { z } from 'zod';
import { user_info_schema } from '~/api/routers/auth';
import { createTRPCHandle } from 'trpc-sveltekit';
import { router } from '~/api/trpc_router';
import { createContext } from '~/api/context';

// Now that we are using id token verification we can no longer preredner any page
// so we can load trpc normally as we would usually do

export const handle_trpc: Handle = createTRPCHandle({ router, createContext });

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
    return handle_trpc({ event, resolve });
  }
  return resolve(event);
};
