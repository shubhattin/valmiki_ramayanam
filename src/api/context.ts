import { UsersSchemaZod } from '~/db/schema_zod';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '~/tools/jwt.server';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';

const access_token_payload_schema = z.object({
  user: UsersSchemaZod.pick({
    id: true,
    user_type: true
  }),
  type: z.literal('api')
});

export async function get_user_from_header(headers: Request['headers']) {
  try {
    const aceess_token = headers.get('Authorization')?.split(' ')[1]!;
    const jwt_data = await jwtVerify(aceess_token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    const payload = access_token_payload_schema.parse(jwt_data.payload);
    return payload.user;
  } catch {}
  return null;
}
export async function createContext(event: RequestEvent) {
  const { request } = event;

  const user = await get_user_from_header(request.headers);
  return {
    user
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
