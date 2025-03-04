import { pgTable, text, smallint, integer, primaryKey } from 'drizzle-orm/pg-core';

export const translations = pgTable(
  'translations',
  {
    lang_id: integer().notNull(),
    kANDa_num: smallint().notNull(),
    sarga_num: smallint().notNull(),
    shloka_num: smallint().notNull(),
    text: text().default('').notNull()
  },
  (table) => [
    primaryKey({ columns: [table.lang_id, table.kANDa_num, table.sarga_num, table.shloka_num] })
  ]
);
