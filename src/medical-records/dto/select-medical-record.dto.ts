import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SelectMedicalRecord {
  @IsNumber()
  @IsOptional()
  id_mr?: number;

  @IsNumber()
  @IsOptional()
  id_pc?: number;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
