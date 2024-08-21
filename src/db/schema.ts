import { pgTable, serial, date, varchar, integer, text, char, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	user_name: text('user_name').notNull(),
	user_id: varchar('user_id', { length: 16 }).notNull().unique(),
	user_email: text('user_email').notNull().unique(),
	password_hash: varchar('password_hash', { length: 64 }).notNull(), // bcrypt hash
	user_type: userTypeEnum('user_type').default('non-admin').notNull()
});
