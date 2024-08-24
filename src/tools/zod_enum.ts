import { z } from 'zod';

export function get_zod_key_enum<T extends string>(obj: {
  [x in T]: any;
}) {
  // gets the zod enum from on object keys
  const keys = Object.keys(obj) as T[];
  const [first, ...other] = keys;
  return z.enum([first, ...other]);
}
