import { t } from './trpc_init';
import { auth_router } from './routers/auth';
import { user_info_router } from './routers/user_info';
import { translations_router } from './routers/translations';
import { ai_router } from './routers/ai/index';
import { user_router } from './routers/user';

export const router = t.router({
  auth: auth_router,
  user: user_router,
  user_info: user_info_router,
  translations: translations_router,
  ai: ai_router
});

export type Router = typeof router;
