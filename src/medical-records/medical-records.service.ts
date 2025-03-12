import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getMedicalRecords() {
    return this.database.select().from(schema.medical_records);
  }

  async createMedicalRecord(
    record: typeof schema.medical_records.$inferInsert,
  ) {
    await this.database.insert(schema.medical_records).values(record);
  }

  async deleteMedicalRecord(id: number) {
    await this.database
      .delete(schema.medical_records)
      .where(eq(schema.medical_records.id_mr, id));
  }

  async updateMedicalRecord(
    id: number,
    updates: Partial<typeof schema.medical_records.$inferInsert>,
  ) {
    await this.database
      .update(schema.medical_records)
      .set(updates)
      .where(eq(schema.medical_records.id_mr, id));
  }

  async getMedicalRecordById(id: number) {
    return this.database
      .select()
      .from(schema.medical_records)
      .where(eq(schema.medical_records.id_mr, id));
  }
}
