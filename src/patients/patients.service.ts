import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PatientsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getPatients() {
    return this.database.select().from(schema.patients);
  }

  async createPatient(patient: typeof schema.patients.$inferInsert) {
    await this.database.insert(schema.patients).values(patient);
  }

  async deletePatient(id: number) {
    await this.database
      .delete(schema.patients)
      .where(eq(schema.patients.id_pc, id));
  }

  async updatePatient(
    id: number,
    updates: Partial<typeof schema.patients.$inferInsert>,
  ) {
    await this.database
      .update(schema.patients)
      .set(updates)
      .where(eq(schema.patients.id_pc, id));
  }

  async getPatientById(id: number) {
    return this.database
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.id_pc, id));
  }

  // Método para obtener datos de la vista paciendatos
  async getPacienDatos() {
    return this.database.run(sql`SELECT * FROM paciendatos`);
  }

  // Método para obtener datos de un paciente específico de la vista
  async getPacienDatosByPatientId(id: number) {
    return this.database.run(sql`SELECT * FROM paciendatos WHERE id_pc = ${id}`);
  }
}
