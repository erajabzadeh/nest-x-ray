import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Scope,
} from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import * as Rx from 'rxjs';

import { MODULE_OPTIONS_TOKEN } from '../rabbitmq.module-definition';
import { RabbitMQConnection } from './rabbitmq-connection.provider';
import type { RabbitMQModuleOptions } from '../interfaces/rabbitmq-module-options.interface';

export type XRayPayload = Record<
  string, // deviceId
  {
    time: number; // timestamp
    data: [
      [
        number, // time
        [
          number, // x-coord
          number, // y-coord
          number, // speed
        ],
      ],
    ];
  }
>;

@Injectable({ scope: Scope.TRANSIENT })
export class RabbitMQChannel implements OnModuleInit, OnModuleDestroy {
  private readonly queue: string;
  private readonly wrapper: ChannelWrapper;
  private readonly logger = new Logger(RabbitMQChannel.name);

  constructor(
    readonly connection: RabbitMQConnection,
    @Inject(MODULE_OPTIONS_TOKEN) options: RabbitMQModuleOptions,
  ) {
    this.queue = options.queue;
    this.wrapper = connection.instance.createChannel();
  }

  async onModuleInit() {
    await this.wrapper
      .assertQueue(this.queue)
      .then((res) => {
        this.logger.log('RabbitMQ queue asserted', res);
      })
      .catch((err) => {
        this.logger.error('RabbitMQ queue assertion failed', err);
      });
  }

  async onModuleDestroy() {
    await this.wrapper?.close();
  }

  consumer() {
    return new Rx.Observable<XRayPayload>((subscriber) => {
      void this.wrapper.consume(
        this.queue,
        (message) => {
          if (message !== null) {
            try {
              const payload = JSON.parse(
                message.content.toString(),
              ) as XRayPayload;
              subscriber.next(payload);
            } catch (err) {
              subscriber.error(err);
            }
            this.wrapper.ack(message);
          } else {
            // cancelled by server
            subscriber.complete();
          }
        },
        { prefetch: 1 },
      );
    });
  }

  async publish(message: string) {
    const done = await this.wrapper.sendToQueue(
      this.queue,
      Buffer.from(message),
    );
    return done;
  }
}
