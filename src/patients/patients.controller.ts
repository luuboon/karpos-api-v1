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
import { Public } from 'src/auth/decorators/public.decorator';

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

  // Endpoint para obtener datos de la vista paciendatos
  @Public()
  @Get('view/pacien-datos')
  async getPacienDatos() {
    return this.patientsService.getPacienDatos();
  }

  // Endpoint para obtener datos de un paciente específico de la vista
  @Public()
  @Get('view/pacien-datos/:id')
  async getPacienDatosByPatientId(@Param('id') id: string) {
    return this.patientsService.getPacienDatosByPatientId(Number(id));
  }
}
