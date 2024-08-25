import type { ID_TOKEN_INFO_SCHEMA } from '@tools/auth_tools';
import { z } from 'zod';
import { writable } from 'svelte/store';

export const user_info = writable<z.infer<typeof ID_TOKEN_INFO_SCHEMA> | null>(null);
