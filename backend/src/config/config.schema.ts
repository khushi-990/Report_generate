import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConfigDocument = Config & Document;

@Schema({ timestamps: true })
export class Config {
  @Prop({ required: true, unique: true, default: 'pagination' })
  key: string;

  @Prop({ required: true, default: 10 })
  pageSize: number;

  @Prop({ default: 1 })
  currentPage: number;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);

