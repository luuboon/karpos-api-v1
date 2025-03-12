import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class DoctorsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getDoctors() {
    return this.database.select().from(schema.doctors);
  }

  async createDoctor(doctor: typeof schema.doctors.$inferInsert) {
    await this.database.insert(schema.doctors).values(doctor);
  }

  async deleteDoctor(id: number) {
    await this.database
      .delete(schema.doctors)
      .where(eq(schema.doctors.id_dc, id));
  }

  async updateDoctor(
    id: number,
    updates: Partial<typeof schema.doctors.$inferInsert>,
  ) {
    await this.database
      .update(schema.doctors)
      .set(updates)
      .where(eq(schema.doctors.id_dc, id));
  }

  async getDoctorById(id: number) {
    return this.database
      .select()
      .from(schema.doctors)
      .where(eq(schema.doctors.id_dc, id));
  }
}
