import { t } from './trpc_init';
import { translations_router } from './routers/translations';
import { ai_router } from './routers/ai/index';

export const router = t.router({
  translations: translations_router,
  ai: ai_router
});

export type Router = typeof router;
