import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from '../users/schema';

export const doctors = sqliteTable('doctors', {
  id_dc: integer('id_dc').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido_p: text('apellido_p').notNull(),
  apellido_m: text('apellido_m').notNull(),
  prof_id: text('prof_id').unique().notNull(),
  id_us: integer('id_us')
    .references(() => users.id)
    .notNull(),
});
