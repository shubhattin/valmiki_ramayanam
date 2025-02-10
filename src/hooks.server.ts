import type { Handle, RequestEvent } from '@sveltejs/kit';
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
  if (
    import.meta.env.PROD &&
    // p => q
    (!(import.meta.env.VITE_SITE_URL && import.meta.env.VITE_POSTHOG_URL) ||
      import.meta.env.VITE_SITE_URL === import.meta.env.VITE_POSTHOG_URL) &&
    event.url.pathname.startsWith('/ingest')
  )
    return await handle_posthog_proxy(event);
  if (event.url.pathname.startsWith('/trpc')) return await handle_trpc({ event, resolve });
  return resolve(event);
};

async function handle_posthog_proxy(
  event: RequestEvent<Partial<Record<string, string>>, string | null>
) {
  try {
    const ASSET_HOST = 'us-assets.i.posthog.com';
    const API_HOST = 'us.i.posthog.com';
    const hostname = event.url.pathname.startsWith('/ingest/static/') ? ASSET_HOST : API_HOST;

    // Get the original URL components
    const originalUrl = new URL(event.request.url);

    // Construct the new URL properly
    const newUrl = new URL(
      `https://${hostname}${event.url.pathname.replace(/^\/ingest/, '')}${originalUrl.search}`
    );

    // Forward the original headers
    const headers = new Headers(event.request.headers);
    headers.set('host', hostname);

    // Remove any problematic headers
    headers.delete('connection');
    headers.delete('content-length');

    // Proxy the request
    const response = await fetch(newUrl.toString(), {
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
  } catch (error: any) {
    console.error('Proxy error:', error);
    return new Response(`Proxy error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
