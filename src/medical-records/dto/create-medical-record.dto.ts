import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMedicalRecord {
  @IsNumber()
  @IsNotEmpty()
  id_pc: number;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  treatment: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
