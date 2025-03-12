import { IsString, IsNumber, Length, IsOptional } from 'class-validator';

export class SelectDoctor {
  @IsNumber()
  @IsOptional()
  id_dc?: number;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido_p?: string;

  @IsString()
  @IsOptional()
  apellido_m?: string;

  @IsString()
  @Length(8, 8)
  @IsOptional()
  prof_id?: string;

  @IsNumber()
  @IsOptional()
  id_us?: number;
}
