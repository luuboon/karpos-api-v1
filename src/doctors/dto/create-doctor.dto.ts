import { IsString, IsNumber, Length, IsNotEmpty } from 'class-validator';

export class CreateDoctor {
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

  @IsNumber()
  @IsNotEmpty()
  id_us: number;
}
