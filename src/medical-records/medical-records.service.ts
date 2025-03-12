import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as appointmentsSchema from '../appointments/schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq, and, desc } from 'drizzle-orm';

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

  async getMedicalRecordByAppointmentId(appointmentId: number) {
    // Primero obtenemos la cita para saber el id del paciente
    const appointment = await this.database
      .select()
      .from(appointmentsSchema.appointments)
      .where(eq(appointmentsSchema.appointments.id_ap, appointmentId))
      .limit(1);

    if (!appointment || appointment.length === 0) {
      return null;
    }

    const patientId = appointment[0].id_pc;
    
    // Buscamos el historial médico más reciente para este paciente
    // Idealmente, deberíamos tener una relación directa entre citas e historiales médicos
    const medicalRecords = await this.database
      .select()
      .from(schema.medical_records)
      .where(eq(schema.medical_records.id_pc, patientId))
      .orderBy(desc(schema.medical_records.created_at))
      .limit(1);

    return medicalRecords.length > 0 ? medicalRecords[0] : null;
  }
}
