import { Controller, Get, Put, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('pagination')
  async getPaginationConfig() {
    try {
      const config = await this.configService.getPaginationConfig();
      return config;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error fetching pagination config',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('pagination')
  async updatePaginationConfig(@Body() body: { pageSize: number }) {
    try {
      if (!body.pageSize || body.pageSize < 1) {
        throw new HttpException('Invalid pageSize', HttpStatus.BAD_REQUEST);
      }
      const config = await this.configService.updatePaginationConfig(body.pageSize);
      return config;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Error updating pagination config',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

