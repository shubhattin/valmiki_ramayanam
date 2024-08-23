import { t } from './trpc_init';
import { auth_router } from './routers/auth';
import { user_info_router } from './routers/user_info';

export const router = t.router({
  auth: auth_router,
  user_info: user_info_router
});

export type Router = typeof router;
