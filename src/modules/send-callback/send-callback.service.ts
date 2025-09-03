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
      process.env.CALLBACK_URL4,
    ].filter((u): u is string => !!u);

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

    // const payload = {
    //   id: randomUUID(),
    //   partnerId,
    //   merchantId,
    //   amount,
    //   status: 'Success',
    //   ...(selectedCallbackUrl
    //     ? { callbackUrl: selectedCallbackUrl + '/partner-callback' }
    //     : {}),
    // };

    const baseCallbackUrl = process.env.PARTNER_CALLBACK_URL;
    if (!baseCallbackUrl) {
      throw new BadRequestException(
        'Missing PARTNER_CALLBACK_URL env var. Please set it in your .env file.',
      );
    }
    const partnerCallbackUrl: string =
      baseCallbackUrl + '/api/callback/stress-test';

    console.log('partnerCallbackUrl', partnerCallbackUrl);

    const run = async (payload: any, partnerCode: string) => {
      const res = await axios.post(partnerCallbackUrl, payload);

      // if success
      if (res.status >= 200 && res.status < 300) {
        await this.redis.incr(`vendor-send:${partnerCode}`);
      }
    };

    // using promises: collect in a normal loop (no map) and run concurrently
    const promises: Promise<void>[] = [];
    for (let i = 0; i < count; i++) {
      const selectedCallbackUrl =
        callbackUrlCandidates.length > 0
          ? callbackUrlCandidates[
              Math.floor(Math.random() * callbackUrlCandidates.length)
            ]
          : undefined;

      // Derive partner code (A/B/C/D) from the last path segment of the selected callback URL
      const partnerCode = (() => {
        if (!selectedCallbackUrl) return 'unknown';
        try {
          const url = new URL(selectedCallbackUrl);
          const segments = url.pathname.split('/').filter(Boolean);
          const last = segments[segments.length - 1] || '';
          const code = last.charAt(0).toUpperCase();
          return ['A', 'B', 'C', 'D'].includes(code) ? code : 'unknown';
        } catch {
          return 'unknown';
        }
      })();

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
      promises.push(run(payload, partnerCode));
    }

    await Promise.all(promises);

    // for (let i = 0; i < count; i++) {
    //   const res = await axios.post(partnerCallbackUrl, payload);

    //   // if success
    //   if (res.status >= 200 && res.status < 300) {
    //     await this.redis.incr(`vendor-send:${partnerCode}`);
    //   }
    // }
    return { status: 200 };
  }

  async getCounter(): Promise<Record<string, number>> {
    const codes = ['A', 'B', 'C', 'D', 'unknown'] as const;
    const keys = codes.map((c) => `vendor-send:${c}`);
    const values = await this.redis.mget(...keys);
    const result: Record<string, number> = {};
    let total = 0;
    values.forEach((v, i) => {
      const n = Number(v ?? 0);
      result[codes[i]] = n;
      total += n;
    });
    result.total = total;
    return result;
  }

  async resetCounter(): Promise<Record<string, number>> {
    const codes = ['A', 'B', 'C', 'D', 'unknown'] as const;
    for (const c of codes) {
      await this.redis.set(`vendor-send:${c}`, 0);
    }
    const keys = codes.map((c) => `vendor-send:${c}`);
    const values = await this.redis.mget(...keys);
    const result: Record<string, number> = {};
    let total = 0;
    values.forEach((v, i) => {
      const n = Number(v ?? 0);
      result[codes[i]] = n;
      total += n;
    });
    result.total = total;
    return result;
  }
}
