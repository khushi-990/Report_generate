import { Controller, Post, Body, Res, Get, Put, Delete, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { Report } from './report.schema';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    @InjectModel(Report.name) private reportModel: Model<Report>,
  ) {}

  @Post('generate')
  async generatePdf(@Body() data: any, @Res() res: Response) {
    try {
      let reportData;
      
      if (data._id) {
        reportData = await this.reportModel.findByIdAndUpdate(
          data._id,
          { ...data, userDownloadedPdf: true },
          { new: true }
        );
      } else {
        reportData = new this.reportModel({ ...data, userDownloadedPdf: true });
        await reportData.save();
      }

    const pdfBuffer = await this.pdfService.generateReport(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error generating PDF',
          stack: error.stack,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports')
  async getAllReports(
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    try {
      const validSortFields = [
        'clientCode',
        'jobNo',
        'date',
        'reportDate',
        'clientName',
        'address',
        'gstNo',
        'city',
        'contactName',
        'contactNo',
        'nameOfWork',
        'reportNo',
        'discount',
        'sgst',
        'cgst',
        'createdAt',
      ];

      let sortCriteria: any = { createdAt: -1 };

      if (sortBy && validSortFields.includes(sortBy)) {
        const order = sortOrder === 'asc' ? 1 : -1;
        sortCriteria = { [sortBy]: order };
      }

      const reports = await this.reportModel.find().sort(sortCriteria).exec();
      return reports;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error fetching reports',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports/:id')
  async getReport(@Param('id') id: string) {
    try {
      const report = await this.reportModel.findById(id).exec();
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return report;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error fetching report',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('reports/:id')
  async updateReport(@Param('id') id: string, @Body() data: any) {
    try {
      const report = await this.reportModel.findByIdAndUpdate(id, data, { new: true }).exec();
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return report;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error updating report',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('view/:id')
  async viewPdf(@Param('id') id: string, @Res() res: Response) {
    try {
      const report = await this.reportModel.findById(id).exec();
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }

      const reportData = report.toObject();
      const pdfBuffer = await this.pdfService.generateReport(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=report.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error generating PDF',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('reports/:id')
  async deleteReport(@Param('id') id: string) {
    try {
      const report = await this.reportModel.findByIdAndDelete(id).exec();
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Report deleted successfully' };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error deleting report',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

