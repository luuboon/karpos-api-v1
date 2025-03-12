import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { CreateUser } from './dto/create-user.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getUsers() {
    return this.database.select().from(schema.users);
  }

  async createUser(user: typeof schema.users.$inferInsert) {
    await this.database.insert(schema.users).values(user);
  }

  async deleteUser(id: typeof schema.users.$inferSelect.id) {
    await this.database.delete(schema.users).where(eq(schema.users.id, id));
  }

  async updateUser(
    id: typeof schema.users.$inferSelect.id,
    updates: Partial<typeof schema.users.$inferInsert>,
  ) {
    await this.database
      .update(schema.users)
      .set(updates)
      .where(eq(schema.users.id, id));
  }
}
