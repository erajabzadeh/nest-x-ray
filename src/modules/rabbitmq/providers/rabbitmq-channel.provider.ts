import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChannelWrapper } from 'amqp-connection-manager';
import Rx from 'rxjs';

import { MODULE_OPTIONS_TOKEN } from '../rabbitmq.module-definition';
import { RabbitMQConnection } from './rabbitmq-connection.provider';
import type { RabbitMQModuleOptions } from '../interfaces/rabbitmq-module-options.interface';

@Injectable()
export class RabbitMQChannel {
  private readonly queue: string;
  private readonly channel: ChannelWrapper;
  private readonly logger = new Logger(RabbitMQChannel.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) options: RabbitMQModuleOptions,
    readonly connection: RabbitMQConnection,
  ) {
    this.queue = options.queue;
    this.channel = connection.instance.createChannel({ json: true });

    void this.channel
      .waitForConnect()
      .then(() => {
        this.channel
          .assertQueue(this.queue)
          .then((res) => {
            this.logger.log('RabbitMQ queue asserted', res);
          })
          .catch((err) => {
            this.logger.error('RabbitMQ queue assertion failed', err);
          });
      })
      .catch((err) => {
        this.logger.error('RabbitMQ connection not established', err);
      });
  }

  consumer<T = unknown>() {
    return new Rx.Observable<T>((subscriber) => {
      void this.channel.consume(this.queue, (message) => {
        if (message !== null) {
          try {
            const payload = JSON.parse(message.content.toString()) as T;
            subscriber.next(payload);
          } catch (err) {
            subscriber.error(err);
          }
          this.channel.ack(message);
        } else {
          // cancelled by server
          subscriber.complete();
        }
      });
    });
  }

  async publish(message: string) {
    const done = await this.channel.sendToQueue(
      this.queue,
      Buffer.from(message),
    );
    return done;
  }
}
