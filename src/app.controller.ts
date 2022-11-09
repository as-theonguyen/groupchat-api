import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('ping')
  @HttpCode(200)
  ping() {
    return { ping: 'pong' };
  }
}
