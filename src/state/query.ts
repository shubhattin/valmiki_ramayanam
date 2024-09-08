import { browser } from '$app/environment';
import { QueryClient } from '@tanstack/svelte-query';

export const STALE_TIME = 1000 * 60 * 8; // by default data will stay fresh for 8 minutes

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: browser,
      staleTime: STALE_TIME
    }
  }
});