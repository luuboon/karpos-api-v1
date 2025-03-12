import {
  IsEmail,
  IsString,
  MinLength,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

export class RegisterPatientDto {
  // Datos de usuario
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  // Datos personales del paciente
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido_p: string;

  @IsString()
  @IsNotEmpty()
  apellido_m: string;

  @IsNumber()
  @Min(0)
  @Max(150)
  @IsNotEmpty()
  age: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  @IsNotEmpty()
  weight: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  @IsNotEmpty()
  height: number;

  @IsEnum(['male', 'female', 'other'])
  @IsNotEmpty()
  gender: 'male' | 'female' | 'other';

  @IsString()
  @IsNotEmpty()
  blood_type: string;
} 