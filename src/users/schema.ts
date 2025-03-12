import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  refresh_token: text('refresh_token'),
  role: text('role', { enum: ['admin', 'doctor', 'patient'] })
    .default('patient')
    .notNull(),
  created_at: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updated_at: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
