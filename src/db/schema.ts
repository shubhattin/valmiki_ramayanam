import { pgTable, serial, date, varchar, integer, text, char, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  user_name: varchar('user_name', { length: 50 }).notNull(),
  user_id: varchar('user_id', { length: 25 }).notNull().unique(),
  user_email: text('user_email').notNull().unique(),
  password_hash: varchar('password_hash', { length: 96 }).notNull(), // sha-256 + hash -> 64 + 32
  contact_number: varchar('contact_number', { length: 17 }), // optional
  user_type: userTypeEnum('user_type').default('non-admin').notNull()
});
