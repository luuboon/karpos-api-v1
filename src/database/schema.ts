import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const appointments = sqliteTable('appointments', {
  id_ap: integer('id_ap').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  description: text('description'),
  patient_id: integer('patient_id').notNull(),
  doctor_id: integer('doctor_id').notNull(),
});
