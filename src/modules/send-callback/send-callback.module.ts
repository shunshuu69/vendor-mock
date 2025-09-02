import { Module } from '@nestjs/common';
import { SendCallbackController } from './send-callback.controller';
import { SendCallbackService } from './send-callback.service';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [SendCallbackController],
  providers: [SendCallbackService],
})
export class SendCallbackModule {}
