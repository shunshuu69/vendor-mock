import { Body, Controller, Post } from '@nestjs/common';
import { SendCallbackService } from './send-callback.service';

@Controller('send-callback')
export class SendCallbackController {
  constructor(private readonly sendCallbackService: SendCallbackService) {}

  @Post()
  async sendCallback(@Body() body: any) {
    return await this.sendCallbackService.sendCallback(body);
  }
}
