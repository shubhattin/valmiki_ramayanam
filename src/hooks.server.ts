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
  // Handle static assets redirect
  if (event.url.pathname.startsWith('/ingest')) {
    const ASSET_HOST = 'https://us-assets.i.posthog.com';
    const API_HOST = 'https://us.i.posthog.com';
    const hostname = event.url.pathname.startsWith('/ingest/static/') ? ASSET_HOST : API_HOST;

    // Create new URL for proxying
    const newUrl = new URL(event.url);
    newUrl.protocol = 'https';
    newUrl.hostname = hostname;
    newUrl.port = '443';
    newUrl.pathname = event.url.pathname.replace(/^\/ingest/, '');

    // Forward the original headers
    const headers = new Headers(event.request.headers);
    headers.set('host', hostname);

    try {
      // Proxy the request
      const response = await fetch(newUrl, {
        method: event.request.method,
        headers,
        body:
          event.request.method !== 'GET' && event.request.method !== 'HEAD'
            ? await event.request.blob()
            : undefined
      });

      // Return the proxied response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response('Proxy error', { status: 500 });
    }
  }
  if (event.url.pathname.startsWith('/trpc')) {
    return handle_trpc({ event, resolve });
  }
  return resolve(event);
};
