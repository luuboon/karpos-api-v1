import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq } from 'drizzle-orm';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getAppointments() {
    return this.database.select().from(schema.appointments);
  }

  async createAppointment(
    appointment: typeof schema.appointments.$inferInsert,
  ) {
    await this.database.insert(schema.appointments).values(appointment);
  }

  async deleteAppointment(id: number) {
    await this.database
      .delete(schema.appointments)
      .where(eq(schema.appointments.id_ap, id));
  }

  async updateAppointment(
    id: number,
    updates: Partial<typeof schema.appointments.$inferInsert>,
  ) {
    await this.database
      .update(schema.appointments)
      .set(updates)
      .where(eq(schema.appointments.id_ap, id));
  }

  async getAppointmentById(id: number) {
    return this.database
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.id_ap, id));
  }

  async getAppointmentsByPatientId(patientId: number) {
    return this.database
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.id_pc, patientId))
      .orderBy(schema.appointments.date, schema.appointments.time);
  }

  async cancelAppointment(id: number) {
    await this.database
      .update(schema.appointments)
      .set({ status: 'cancelled' })
      .where(eq(schema.appointments.id_ap, id));
    
    return { message: 'Cita cancelada exitosamente' };
  }
}
