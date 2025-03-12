import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointment } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async getAppointments() {
    return this.appointmentsService.getAppointments();
  }

  @Get('detailed')
  async getDetailedAppointments() {
    return this.appointmentsService.getDetailedAppointments();
  }

  @Get('filtered')
  async getFilteredAppointments(
    @Query('status') status: 'pending' | 'completed' | 'cancelled',
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.appointmentsService.getFilteredAppointments(
      status,
      patientId ? Number(patientId) : undefined,
      doctorId ? Number(doctorId) : undefined,
      fromDate,
      toDate,
    );
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.appointmentsService.getAppointmentById(Number(id));
  }

  @Get(':id/detailed')
  async getDetailedAppointment(@Param('id') id: string) {
    return this.appointmentsService.getDetailedAppointmentById(Number(id));
  }

  @Post()
  async createAppointment(@Body() appointment: CreateAppointment) {
    return this.appointmentsService.createAppointment(appointment);
  }

  @Delete(':id')
  async deleteAppointment(@Param('id') id: string) {
    return this.appointmentsService.deleteAppointment(Number(id));
  }

  @Put(':id')
  async updateAppointment(
    @Param('id') id: string,
    @Body() updates: Partial<CreateAppointment>,
  ) {
    return this.appointmentsService.updateAppointment(Number(id), updates);
  }

  @Get('patient/:patientId')
  async getPatientAppointments(@Param('patientId') patientId: string) {
    return this.appointmentsService.getAppointmentsByPatientId(Number(patientId));
  }

  @Get('patient/:patientId/detailed')
  async getDetailedPatientAppointments(@Param('patientId') patientId: string) {
    return this.appointmentsService.getDetailedAppointmentsByPatientId(Number(patientId));
  }

  @Get('doctor/:doctorId')
  async getDoctorAppointments(@Param('doctorId') doctorId: string) {
    return this.appointmentsService.getAppointmentsByDoctorId(Number(doctorId));
  }

  @Patch(':id/cancel')
  async cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(Number(id));
  }

  @Get('doctor/:doctorId/availability')
  async getDoctorAvailability(
    @Param('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getDoctorAvailability(Number(doctorId), date);
  }

  @Post(':id/notification')
  async saveNotificationId(
    @Param('id') id: string,
    @Body() data: { notificationId: string },
  ) {
    return this.appointmentsService.saveNotificationId(Number(id), data.notificationId);
  }
}
