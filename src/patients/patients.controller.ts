import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatient } from './dto/create-patient.dto';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async getPatients() {
    return this.patientsService.getPatients();
  }

  @Get(':id')
  async getPatient(@Param('id') id: string) {
    return this.patientsService.getPatientById(Number(id));
  }

  @Post()
  async createPatient(@Body() patient: CreatePatient) {
    return this.patientsService.createPatient(patient);
  }

  @Delete(':id')
  async deletePatient(@Param('id') id: string) {
    return this.patientsService.deletePatient(Number(id));
  }

  @Put(':id')
  async updatePatient(
    @Param('id') id: string,
    @Body() updates: Partial<CreatePatient>,
  ) {
    return this.patientsService.updatePatient(Number(id), updates);
  }
}
