import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import ky from 'ky';

export type user_verfied_info_type = {
  is_approved: boolean;
  langugaes: {
    lang_id: number;
    lang_name: string;
  }[];
};

export const AUTH_INFO_URL = `${PUBLIC_BETTER_AUTH_URL}/hono`;
export const PROJECT_ID = 1; // as defined in tsc_user database

export const get_user_project_info = async (user_id: string, cookie?: string | null) => {
  const data = await ky
    .get<user_verfied_info_type>(`${AUTH_INFO_URL}/user/user_info_project`, {
      searchParams: {
        user_id: user_id,
        project_id: PROJECT_ID
      },
      ...(!cookie
        ? {
            credentials: 'include'
          }
        : {
            headers: {
              Cookie: cookie
            }
          })
    })
    .json();
  return data;
};
