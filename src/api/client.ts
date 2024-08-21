import type { Router } from '@api/trpc_router';
import { httpBatchLink } from '@trpc/client';
import { createTRPCClient } from 'trpc-sveltekit';
import transformer from './transformer';

let jwt_token: string;

export const setAccessToken = (token: string) => {
  // to set the jwt_token while we make trpc request
  jwt_token = token;
};

export const client = createTRPCClient<Router>({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers() {
        return {
          Authorization: `Bearer ${jwt_token}`
        };
      }
    })
  ],
  transformer
});
