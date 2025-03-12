import {
  IsString,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateAppointment {
  @IsNumber()
  @IsNotEmpty()
  id_pc: number;

  @IsNumber()
  @IsNotEmpty()
  id_dc: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsEnum(['pending', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'cancelled';

  @IsEnum(['pending', 'paid', 'failed'])
  @IsOptional()
  payment_status?: 'pending' | 'paid' | 'failed';

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  payment_amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
