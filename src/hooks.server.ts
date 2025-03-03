import type { Handle, RequestEvent } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { router } from '~/api/trpc_router';
import { createContext } from '~/api/context';

export const handle_trpc: Handle = createTRPCHandle({ router, createContext });

export const handle: Handle = async ({ event, resolve }) => {
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
