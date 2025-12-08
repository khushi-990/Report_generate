import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true })
  clientCode: string;

  @Prop({ required: true })
  jobNo: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  reportDate: string;

  @Prop({ required: true })
  clientName: string;

  @Prop()
  address: string;

  @Prop()
  gstNo: string;

  @Prop()
  city: string;

  @Prop()
  contactName: string;

  @Prop()
  contactNo: string;

  @Prop()
  nameOfWork: string;

  @Prop({ type: Array })
  materials: Array<{
    id: string;
    material: string;
    tests: string[];
    quantities: number[];
    rates: number[];
    ratesWithST: number[];
  }>;

  @Prop({ default: 20 })
  discount: number;

  @Prop({ default: 9 })
  sgst: number;

  @Prop({ default: 9 })
  cgst: number;

  @Prop()
  reportNo: string;

  @Prop()
  client: string;

  @Prop()
  refNo: string;

  @Prop({ default: false })
  userDownloadedPdf: boolean;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

