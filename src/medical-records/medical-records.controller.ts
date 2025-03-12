import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecord } from './dto/create-medical-record.dto';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  async getMedicalRecords() {
    return this.medicalRecordsService.getMedicalRecords();
  }

  @Get(':id')
  async getMedicalRecord(@Param('id') id: string) {
    return this.medicalRecordsService.getMedicalRecordById(Number(id));
  }

  @Post()
  async createMedicalRecord(@Body() record: CreateMedicalRecord) {
    return this.medicalRecordsService.createMedicalRecord(record);
  }

  @Delete(':id')
  async deleteMedicalRecord(@Param('id') id: string) {
    return this.medicalRecordsService.deleteMedicalRecord(Number(id));
  }

  @Put(':id')
  async updateMedicalRecord(
    @Param('id') id: string,
    @Body() updates: Partial<CreateMedicalRecord>,
  ) {
    return this.medicalRecordsService.updateMedicalRecord(Number(id), updates);
  }

  @Get('appointment/:appointmentId')
  async getMedicalRecordByAppointmentId(@Param('appointmentId') appointmentId: string) {
    return this.medicalRecordsService.getMedicalRecordByAppointmentId(Number(appointmentId));
  }
}
