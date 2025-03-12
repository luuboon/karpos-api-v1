import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class SelectPatient {
  @IsNumber()
  @IsOptional()
  id_pc?: number;

  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido_p?: string;

  @IsString()
  @IsOptional()
  apellido_m?: string;

  @IsNumber()
  @Min(0)
  @Max(150)
  @IsOptional()
  age?: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  @IsOptional()
  height?: number;

  @IsEnum(['male', 'female', 'other'])
  @IsOptional()
  gender?: 'male' | 'female' | 'other';

  @IsString()
  @IsOptional()
  blood_type?: string;

  @IsNumber()
  @IsOptional()
  id_us?: number;
}
