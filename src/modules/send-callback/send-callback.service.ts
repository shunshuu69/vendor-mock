import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class SendCallbackService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async sendCallback(body: { count: number }) {
    const count: number = body?.count ?? 10;

    const amount = Math.floor(Math.random() * 1000000);

    const callbackUrlCandidates = [
      process.env.CALLBACK_URL1,
      process.env.CALLBACK_URL2,
      process.env.CALLBACK_URL3,
    ].filter((u): u is string => !!u);

    const selectedCallbackUrl =
      callbackUrlCandidates.length > 0
        ? callbackUrlCandidates[
            Math.floor(Math.random() * callbackUrlCandidates.length)
          ]
        : undefined;

    const partnerId =
      'A' +
      Math.floor(Math.random() * 100)
        .toString()
        .padStart(2, '0');
    const merchantId =
      'A' +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');

    const payload = {
      id: randomUUID(),
      partnerId,
      merchantId,
      amount,
      status: 'Success',
      ...(selectedCallbackUrl
        ? { callbackUrl: selectedCallbackUrl + '/partner-callback' }
        : {}),
    };

    const baseCallbackUrl = process.env.PARTNER_CALLBACK_URL;
    if (!baseCallbackUrl) {
      throw new BadRequestException(
        'Missing PARTNER_CALLBACK_URL env var. Please set it in your .env file.',
      );
    }
    const partnerCallbackUrl: string =
      baseCallbackUrl + '/api/callback/stress-test';

    console.log('partnerCallbackUrl', partnerCallbackUrl);

    for (let i = 0; i < count; i++) {
      await axios.post(partnerCallbackUrl, payload);
      await this.redis.incr('vendor-send');
    }
    return { status: 200 };
  }

  async getCounter(): Promise<number> {
    const value = await this.redis.get('vendor-send');
    return Number(value ?? 0);
  }

  async resetCounter(): Promise<number> {
    await this.redis.set('vendor-send', 0);
    const value = await this.redis.get('vendor-send');
    return Number(value ?? 0);
  }
}
