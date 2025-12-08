import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfController } from './pdf/pdf.controller';
import { PdfService } from './pdf/pdf.service';
import { Report, ReportSchema } from './pdf/report.schema';
import { Config, ConfigSchema } from './config/config.schema';
import { ConfigController } from './config/config.controller';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/report_generator'),
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
  ],
  controllers: [AppController, PdfController, ConfigController],
  providers: [AppService, PdfService, ConfigService],
})
export class AppModule {}

