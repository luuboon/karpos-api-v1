import { Inject, Injectable } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import { DATABASE_CONNECTION } from 'src/database/database.module';
import { eq, and, sql, between, desc } from 'drizzle-orm';
import { doctors } from '../doctors/schema';
import { patients } from '../patients/schema';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: LibSQLDatabase<typeof schema>,
  ) {}

  async getAppointments() {
    return this.database.select().from(schema.appointments);
  }

  async getDetailedAppointments() {
    return this.database
      .select({
        appointment: schema.appointments,
        doctor: {
          id: doctors.id_dc,
          nombre: doctors.nombre,
          apellido_p: doctors.apellido_p,
          apellido_m: doctors.apellido_m,
          prof_id: doctors.prof_id,
        },
        patient: {
          id: patients.id_pc,
          nombre: patients.nombre,
          apellido_p: patients.apellido_p,
          apellido_m: patients.apellido_m,
        },
      })
      .from(schema.appointments)
      .leftJoin(doctors, eq(schema.appointments.id_dc, doctors.id_dc))
      .leftJoin(patients, eq(schema.appointments.id_pc, patients.id_pc))
      .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
  }

  async getFilteredAppointments(
    status: 'pending' | 'completed' | 'cancelled',
    patientId?: number,
    doctorId?: number,
    fromDate?: string,
    toDate?: string,
  ) {
    const baseQuery = this.database
      .select({
        appointment: schema.appointments,
        doctor: {
          id: doctors.id_dc,
          nombre: doctors.nombre,
          apellido_p: doctors.apellido_p,
          apellido_m: doctors.apellido_m,
          prof_id: doctors.prof_id,
        },
        patient: {
          id: patients.id_pc,
          nombre: patients.nombre,
          apellido_p: patients.apellido_p,
          apellido_m: patients.apellido_m,
        },
      })
      .from(schema.appointments)
      .leftJoin(doctors, eq(schema.appointments.id_dc, doctors.id_dc))
      .leftJoin(patients, eq(schema.appointments.id_pc, patients.id_pc));

    // Aplicar filtros
    if (status) {
      return baseQuery
        .where(eq(schema.appointments.status, status))
        .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
    }

    if (patientId) {
      return baseQuery
        .where(eq(schema.appointments.id_pc, patientId))
        .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
    }

    if (doctorId) {
      return baseQuery
        .where(eq(schema.appointments.id_dc, doctorId))
        .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
    }

    if (fromDate && toDate) {
      return baseQuery
        .where(between(schema.appointments.date, fromDate, toDate))
        .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
    }

    // Si no hay filtros, retornar todas las citas ordenadas
    return baseQuery.orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
  }

  async createAppointment(
    appointment: typeof schema.appointments.$inferInsert,
  ) {
    const result = await this.database.insert(schema.appointments).values(appointment).returning();
    return result[0];
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

  async getDetailedAppointmentById(id: number) {
    return this.database
      .select({
        appointment: schema.appointments,
        doctor: {
          id: doctors.id_dc,
          nombre: doctors.nombre,
          apellido_p: doctors.apellido_p,
          apellido_m: doctors.apellido_m,
          prof_id: doctors.prof_id,
        },
        patient: {
          id: patients.id_pc,
          nombre: patients.nombre,
          apellido_p: patients.apellido_p,
          apellido_m: patients.apellido_m,
        },
      })
      .from(schema.appointments)
      .leftJoin(doctors, eq(schema.appointments.id_dc, doctors.id_dc))
      .leftJoin(patients, eq(schema.appointments.id_pc, patients.id_pc))
      .where(eq(schema.appointments.id_ap, id));
  }

  async getAppointmentsByPatientId(patientId: number) {
    return this.database
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.id_pc, patientId))
      .orderBy(schema.appointments.date, schema.appointments.time);
  }

  async getDetailedAppointmentsByPatientId(patientId: number) {
    return this.database
      .select({
        appointment: schema.appointments,
        doctor: {
          id: doctors.id_dc,
          nombre: doctors.nombre,
          apellido_p: doctors.apellido_p,
          apellido_m: doctors.apellido_m,
          prof_id: doctors.prof_id,
        },
      })
      .from(schema.appointments)
      .leftJoin(doctors, eq(schema.appointments.id_dc, doctors.id_dc))
      .where(eq(schema.appointments.id_pc, patientId))
      .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
  }

  async getAppointmentsByDoctorId(doctorId: number) {
    return this.database
      .select({
        appointment: schema.appointments,
        patient: {
          id: patients.id_pc,
          nombre: patients.nombre,
          apellido_p: patients.apellido_p,
          apellido_m: patients.apellido_m,
        },
      })
      .from(schema.appointments)
      .leftJoin(patients, eq(schema.appointments.id_pc, patients.id_pc))
      .where(eq(schema.appointments.id_dc, doctorId))
      .orderBy(desc(schema.appointments.date), desc(schema.appointments.time));
  }

  async cancelAppointment(id: number) {
    await this.database
      .update(schema.appointments)
      .set({ status: 'cancelled' })
      .where(eq(schema.appointments.id_ap, id));
    
    return { message: 'Cita cancelada exitosamente' };
  }

  async getDoctorAvailability(doctorId: number, date: string) {
    // Horarios disponibles por defecto (9:00 AM a 5:00 PM, cada 30 minutos)
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];
    
    // Obtener citas existentes para el doctor en la fecha especificada
    const existingAppointments = await this.database
      .select({ time: schema.appointments.time })
      .from(schema.appointments)
      .where(
        and(
          eq(schema.appointments.id_dc, doctorId),
          eq(schema.appointments.date, date),
          eq(schema.appointments.status, 'pending')
        )
      );
    
    // Extraer los horarios ocupados
    const bookedTimeSlots = existingAppointments.map(app => app.time);
    
    // Filtrar los horarios disponibles
    const availableTimeSlots = allTimeSlots.filter(
      time => !bookedTimeSlots.includes(time)
    );
    
    return {
      date,
      doctorId,
      availableTimeSlots
    };
  }

  async saveNotificationId(appointmentId: number, notificationId: string) {
    // Aquí deberíamos tener una tabla para almacenar los IDs de notificación
    // Como no la tenemos, podríamos usar el campo notes para almacenarlo temporalmente
    await this.database
      .update(schema.appointments)
      .set({ 
        notes: sql`CASE 
          WHEN notes IS NULL OR notes = '' THEN ${`notification:${notificationId}`}
          ELSE ${`${sql`notes`} | notification:${notificationId}`}
        END`
      })
      .where(eq(schema.appointments.id_ap, appointmentId));
    
    return { message: 'ID de notificación guardado exitosamente' };
  }
}
