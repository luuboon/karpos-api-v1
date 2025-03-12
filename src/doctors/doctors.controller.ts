import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctor } from './dto/create-doctor.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getDoctors() {
    return this.doctorsService.getDoctors();
  }

  @Get(':id')
  async getDoctor(@Param('id') id: string) {
    return this.doctorsService.getDoctorById(Number(id));
  }

  @Post()
  async createDoctor(@Body() doctor: CreateDoctor) {
    return this.doctorsService.createDoctor(doctor);
  }

  @Delete(':id')
  async deleteDoctor(@Param('id') id: string) {
    return this.doctorsService.deleteDoctor(Number(id));
  }

  @Put(':id')
  async updateDoctor(
    @Param('id') id: string,
    @Body() updates: Partial<CreateDoctor>,
  ) {
    return this.doctorsService.updateDoctor(Number(id), updates);
  }
}
