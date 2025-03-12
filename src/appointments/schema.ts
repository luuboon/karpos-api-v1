import { integer, sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { doctors } from '../doctors/schema';
import { patients } from '../patients/schema';

export const appointments = sqliteTable('appointments', {
  id_ap: integer('id_ap').primaryKey(),
  id_pc: integer('id_pc')
    .references(() => patients.id_pc)
    .notNull(),
  id_dc: integer('id_dc')
    .references(() => doctors.id_dc)
    .notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'cancelled'] })
    .default('pending')
    .notNull(),
  payment_status: text('payment_status', {
    enum: ['pending', 'paid', 'failed'],
  })
    .default('pending')
    .notNull(),
  payment_amount: real('payment_amount').notNull(),
  notes: text('notes'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
