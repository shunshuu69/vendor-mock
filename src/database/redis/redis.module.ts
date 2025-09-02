import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: (): Redis => {
        const keyPrefix = 'counter:';

        const host = process.env.REDIS_HOST || '127.0.0.1';
        const port = parseInt(process.env.REDIS_PORT || '6379', 10);
        const password = process.env.REDIS_PASSWORD || undefined;
        return new Redis({ host, port, password, keyPrefix });
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}
