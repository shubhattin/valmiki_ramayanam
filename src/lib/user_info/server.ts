import type { BetterAuthPlugin } from 'better-auth';

export const userInfoPlugin = () => {
  return {
    id: 'additional_user_info',
    schema: {
      user: {
        fields: {
          is_approved: {
            type: 'boolean',
            defaultValue: false
          }
        }
      }
    }
  } satisfies BetterAuthPlugin;
};
