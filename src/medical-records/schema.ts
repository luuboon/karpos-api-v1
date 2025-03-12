import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { patients } from '../patients/schema';

export const medical_records = sqliteTable('medical_records', {
  id_mr: integer('id_mr').primaryKey(),
  id_pc: integer('id_pc')
    .references(() => patients.id_pc)
    .notNull(),
  diagnosis: text('diagnosis').notNull(),
  treatment: text('treatment').notNull(),
  notes: text('notes'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
