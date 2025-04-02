import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Command extends Document {
  @Prop({ required: true, enum: ['START', 'STOP'] })
  cmd: string;
  
  @Prop({ default: false })
  executed: boolean;
  
  @Prop()
  citaId?: string;
  
  @Prop({ default: Date.now })
  timestamp: Date;
}

export const CommandSchema = SchemaFactory.createForClass(Command); 