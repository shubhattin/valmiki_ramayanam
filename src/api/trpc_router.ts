import { auth_router } from './routers/auth';
import { t } from './trpc_init';

export const router = t.router({
	auth: auth_router
});

export type Router = typeof router;
