import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SendCallbackModule } from './modules/send-callback/send-callback.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), SendCallbackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
