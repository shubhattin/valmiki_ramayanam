// import { UsersSchemaZod } from '@db/schema_zod';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@tools/jwt.server';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

// const jwt_payload_schema = UsersSchemaZod.pick({
//   id: true,
//   user_type: true
// });

export async function createContext(event: RequestEvent) {
	const { request } = event;

	async function getUserFromHeader() {
		try {
			const jwt_token = request.headers.get('Authorization')?.split(' ')[1]!;
			const jwt_data = await jwtVerify(jwt_token, JWT_SECRET, {
				algorithms: ['HS256']
			});
			// const payload = jwt_payload_schema.parse(jwt_data.payload);
			// return payload;
		} catch {}
		return null;
	}

	const user = await getUserFromHeader();
	return {
		user
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;
