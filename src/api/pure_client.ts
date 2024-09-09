import type { Router } from '@api/trpc_router';
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client';
import transformer from './transformer';

const client_options = {
  links: [
    httpBatchLink({
      url: '/trpc'
    })
  ],
  transformer
};

export const client = createTRPCProxyClient<Router>(client_options);
