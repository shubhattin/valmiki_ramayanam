import type { Router } from '~/api/trpc_router';
import { httpBatchLink } from '@trpc/client';
import { createTRPCClient } from 'trpc-sveltekit';
import transformer from './transformer';
import { createTRPCSvelte } from 'trpc-svelte-query';

let jwt_token: string;

export const setAccessToken = (token: string) => {
  // to set the jwt_token while we make trpc request
  jwt_token = token;
};

const client_options = {
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
};

export const client = createTRPCClient<Router>(client_options);
export const client_q = createTRPCSvelte<Router>(client_options);
