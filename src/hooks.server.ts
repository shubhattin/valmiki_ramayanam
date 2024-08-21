import { createContext } from '@api/context';
import { router } from '@api/trpc_router';
import { createTRPCHandle } from 'trpc-sveltekit';
import type { Handle } from '@sveltejs/kit';

//export const handle: Handle = createTRPCHandle({ router, createContext });

// Use this approach to also allow prerendering of static pregenerated pages

const handle_trpc: { func: Handle } = { func: null! };

const set_handle_trpc = async () => {
	// using it in this way to also allow static pregenerated pages
	if (!handle_trpc.func) {
		const { createTRPCHandle } = await import('trpc-sveltekit');
		const { router } = await import('@api/trpc_router');
		const { createContext } = await import('@api/context');
		handle_trpc.func = createTRPCHandle({ router, createContext });
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/trpc')) {
		await set_handle_trpc();
		return handle_trpc.func({ event, resolve });
	}
	return resolve(event);
};
