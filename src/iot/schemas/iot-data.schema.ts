import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class IotData extends Document {
  @Prop({ type: [Number], default: [] })
  pulso: number[];

  @Prop({ type: [Number], default: [] })
  fuerza: number[];

  @Prop()
  fecha: string;  // Formato YYYY-MM-DD para coincidir con el código Arduino

  @Prop()
  cita: string;   // ID de la cita relacionada
  
  // Campos opcionales para información adicional
  @Prop({ required: false })
  deviceId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const IotDataSchema = SchemaFactory.createForClass(IotData); 