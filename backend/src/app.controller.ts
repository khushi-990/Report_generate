import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a hello message
   * @returns {string} Hello message string
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

