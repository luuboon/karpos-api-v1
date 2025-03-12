import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class RegisterDoctorDto {
  // Datos de usuario
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  // Datos personales del doctor
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido_p: string;

  @IsString()
  @IsNotEmpty()
  apellido_m: string;

  @IsString()
  @Length(8, 8)
  @IsNotEmpty()
  prof_id: string;
} 