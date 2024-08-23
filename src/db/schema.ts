import { pgTable, serial, varchar, text, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userTypeEnum = pgEnum('user_type', ['admin', 'non-admin']);
export const langEnum = pgEnum('lang', [
  'Hindi',
  'Telugu',
  'Tamil',
  'Bengali',
  'Kannada',
  'Gujarati',
  'Malayalam',
  'Odia',
  'Sinhala'
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  user_name: varchar('user_name', { length: 50 }).notNull(),
  user_id: varchar('user_id', { length: 25 }).notNull().unique(),
  user_email: text('user_email').notNull().unique(),
  password_hash: varchar('password_hash', { length: 96 }).notNull(), // sha-256 + hash -> 64 + 32
  contact_number: varchar('contact_number', { length: 17 }), // optional
  user_type: userTypeEnum('user_type').default('non-admin').notNull(),
  allowed_langs: langEnum('allowed_langs').array()
});

export const user_verification_requests = pgTable('user_verification_requests', {
  id: integer('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' })
});

/* The relations defined below are only for the `query` API of drizzle */

export const dataRelation = relations(users, ({ one }) => ({
  user_verification_requests: one(user_verification_requests, {
    fields: [users.id],
    references: [user_verification_requests.id]
  })
}));
