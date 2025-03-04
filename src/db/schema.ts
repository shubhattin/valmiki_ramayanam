import { pgTable, text, smallint, integer, primaryKey } from 'drizzle-orm/pg-core';

export const translations = pgTable(
  'translations',
  {
    lang_id: integer('lang_id').notNull(),
    kANDa_num: smallint('kANDa_num').notNull(),
    sarga_num: smallint('sarga_num').notNull(),
    shloka_num: smallint('shloka_num').notNull(),
    text: text('text').default('').notNull()
  },
  (table) => ({
    pk: primaryKey({ columns: [table.lang_id, table.kANDa_num, table.sarga_num, table.shloka_num] })
  })
);
