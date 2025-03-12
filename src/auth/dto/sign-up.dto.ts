import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'doctor', 'patient'])
  role: 'admin' | 'doctor' | 'patient';
}
