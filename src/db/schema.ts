import {
  pgTable,
  serial,
  varchar,
  text,
  pgEnum,
  smallint,
  integer,
  primaryKey,
  boolean
} from 'drizzle-orm/pg-core';
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
  'Sinhala',
  'English'
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  user_name: varchar('user_name', { length: 50 }).notNull(),
  user_id: varchar('user_id', { length: 25 }).notNull().unique(),
  user_email: text('user_email').notNull().unique(),
  password_hash: varchar('password_hash', { length: 96 }).notNull(), // bcrypt hash (60)
  contact_number: varchar('contact_number', { length: 17 }), // optional
  user_type: userTypeEnum('user_type').default('non-admin').notNull(),
  allowed_langs: langEnum('allowed_langs').array()
});
// `unique indexes` are auto created for primary keys

export const user_verification_requests = pgTable('user_verification_requests', {
  id: integer('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  email_verified: boolean('email_verified').default(false).notNull(),
  otp: varchar('otp', { length: 6 }).notNull() // for now 4 in use, sending OTP at start itself
});

export const forgot_pass_otp = pgTable('forgot_pass_otp', {
  id: integer('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  otp: varchar('otp', { length: 6 }).notNull() // for now 4 in use
});
// we dont need to backup this one, as it is only for temporary use

export const translations = pgTable(
  'translations',
  {
    lang: langEnum('lang').notNull(),
    kANDa_num: smallint('kANDa_num').notNull(),
    sarga_num: smallint('sarga_num').notNull(),
    shloka_num: smallint('shloka_num').notNull(),
    text: text('text').default('').notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.lang, table.kANDa_num, table.sarga_num, table.shloka_num] })
  })
);

/* The relations defined below are only for the `query` API of drizzle */
export const userRelation = relations(users, ({ one }) => ({
  user_verification_requests: one(user_verification_requests),
  forgot_pass_otp: one(forgot_pass_otp)
}));

export const userVerificationRelation = relations(user_verification_requests, ({ one }) => ({
  user: one(users, {
    fields: [user_verification_requests.id],
    references: [users.id]
  })
}));

export const forgotPassOtpRelation = relations(forgot_pass_otp, ({ one }) => ({
  user: one(users, {
    fields: [forgot_pass_otp.id],
    references: [users.id]
  })
}));
