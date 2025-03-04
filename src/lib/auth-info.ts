import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';

export type user_verfied_info_type =
  | { is_approved: false }
  | {
      is_approved: true;
      langugaes: {
        lang_id: number;
        lang_name: string;
      }[];
    };

export const AUTH_INFO_URL = `${PUBLIC_BETTER_AUTH_URL}/hono`;
export const PROJECT_ID = 1; // as defined in tsc_user database
