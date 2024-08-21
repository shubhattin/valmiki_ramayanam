import { z } from 'zod';
import { env } from '$env/dynamic/private';

export const JWT_SECRET = (() => {
  const token = env.JWT_SECRET;
  const jwt_token_parse = z.string().safeParse(token);
  if (!jwt_token_parse.success) throw new Error('Please set `JWT_SECRET`');
  return new TextEncoder().encode(jwt_token_parse.data);
})();
