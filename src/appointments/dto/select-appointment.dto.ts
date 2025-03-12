import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class SelectAppointment {
  @IsNumber()
  @IsOptional()
  id_ap?: number;

  @IsNumber()
  @IsOptional()
  id_pc?: number;

  @IsNumber()
  @IsOptional()
  id_dc?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsEnum(['pending', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'cancelled';

  @IsEnum(['pending', 'paid', 'failed'])
  @IsOptional()
  payment_status?: 'pending' | 'paid' | 'failed';

  @IsNumber()
  @Min(0)
  @IsOptional()
  payment_amount?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
