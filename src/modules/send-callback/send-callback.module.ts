import { Module } from '@nestjs/common';
import { SendCallbackController } from './send-callback.controller';
import { SendCallbackService } from './send-callback.service';

@Module({
  imports: [],
  controllers: [SendCallbackController],
  providers: [SendCallbackService],
})
export class SendCallbackModule {}
