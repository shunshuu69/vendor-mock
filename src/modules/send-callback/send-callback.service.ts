import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { randomUUID } from 'crypto';

@Injectable()
export class SendCallbackService {
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
      console.log('sent callback', i + 1);
    }
    return { status: 200 };
  }
}
