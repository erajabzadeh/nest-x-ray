import crypto from 'node:crypto';
import { inspect } from 'node:util';
import { Injectable, Logger } from '@nestjs/common';

import { RabbitMQChannel } from '../../rabbitmq/providers/rabbitmq-channel.provider';

@Injectable()
export class ProducerService {
  private readonly logger = new Logger(ProducerService.name);

  constructor(private readonly channel: RabbitMQChannel) {}

  async generate(count: number) {
    await Promise.all(
      Array.from({ length: count }).map(() => {
        const payload = this.randomPayload();
        this.logger.debug(
          `Publishing message ${inspect(payload, false, null)}`,
        );
        return this.channel.publish(JSON.stringify(payload));
      }),
    );
  }

  private randomPayload() {
    const deviceId = crypto.randomBytes(16).toString('hex');
    const time = Date.now();
    const length = crypto.randomInt(1, 20);
    const data = Array.from({ length }).map(() => [
      crypto.randomInt(1, 1_000_000),
      [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 20],
    ]);

    return {
      [deviceId]: {
        data,
        time,
      },
    };
  }
}
