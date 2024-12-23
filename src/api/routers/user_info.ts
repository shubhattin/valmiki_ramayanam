import { t, protectedAdminProcedure, protectedProcedure } from '~/api/trpc_init';
import { db } from '~/db/db';
import { delay } from '~/tools/delay';

const get_all_user_info_route = protectedAdminProcedure.query(async ({ ctx: { user } }) => {
  await delay(550);
  const other_users_data = await db.query.users.findMany({
    columns: {
      id: true,
      user_id: true,
      user_name: true,
      user_email: true,
      contact_number: true,
      user_type: true,
      allowed_langs: true
    },
    orderBy: ({ user_name }, { asc }) => asc(user_name),
    where: ({ id }, { eq, not }) => not(eq(id, user.id)),
    with: {
      user_verification_requests: {
        columns: {
          email_verified: true
        }
      }
    }
  });
  return other_users_data;
});

const get_user_allowed_langs_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  await delay(300);
  const user_data = await db.query.users.findFirst({
    columns: {
      allowed_langs: true
    },
    where: ({ id }, { eq }) => eq(id, user.id)
  });
  return (user_data?.allowed_langs ?? []) as string[];
});

const get_current_user_info_route = protectedProcedure.query(async ({ ctx: { user } }) => {
  const data = (await db.query.users.findFirst({
    where: ({ id }, { eq }) => eq(id, user.id),
    columns: {
      user_name: true,
      user_email: true,
      user_id: true
    }
  }))!;
  return data;
});

const get_user_verified_status_route = protectedProcedure.query(
  async ({
    ctx: {
      user: { id }
    }
  }) => {
    const user_info = (await db.query.users.findFirst({
      where: (tbl, { eq }) => eq(tbl.id, id),
      columns: {
        id: true
      },
      with: {
        user_verification_requests: {
          columns: {
            email_verified: true
          }
        }
      }
    }))!;
    return {
      user_approved: !user_info.user_verification_requests, // if null then user verfied
      email_verified: user_info.user_verification_requests?.email_verified ?? false
    };
  }
);

export const user_info_router = t.router({
  get_all_users_info: get_all_user_info_route,
  get_user_allowed_langs: get_user_allowed_langs_route,
  get_current_user_info: get_current_user_info_route,
  get_user_verified_status: get_user_verified_status_route
});
