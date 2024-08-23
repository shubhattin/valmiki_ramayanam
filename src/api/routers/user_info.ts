import { t, protectedAdminProcedure } from '@api/trpc_init';
import { db } from '@db/db';

const get_all_user_info_router = protectedAdminProcedure.query(async ({ ctx: { user } }) => {
  const other_users_data = await db.query.users.findMany({
    columns: {
      user_id: true,
      user_name: true,
      user_email: true,
      contact_number: true,
      user_type: true,
      allowed_langs: true
    },
    where: ({ id }, { eq, not }) => not(eq(id, user.id)),
    with: {
      user_verification_requests: true
    }
  });
  return other_users_data;
});

export const user_info_router = t.router({
  get_all_users_info: get_all_user_info_router
});
