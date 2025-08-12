import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import type { ConsumeMessage, Channel } from 'amqplib';

import { MODULE_OPTIONS_TOKEN } from '../rabbitmq.module-definition';
import { type RabbitMQModuleOptions } from '../interfaces/rabbitmq-module-options.interface';

export type XRayPayload = Record<
  string, // deviceId
  {
    time: number; // timestamp
    data: Array<
      [
        number, // time
        [
          number, // x-coord
          number, // y-coord
          number, // speed
        ],
      ]
    >;
  }
>;
export type XRayQueueCallback = (payload: XRayPayload) => Promise<void>;

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.AmqpConnectionManager;
  private channel: amqp.ChannelWrapper;

  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: RabbitMQModuleOptions,
  ) {}

  getConnection() {
    return this.connection;
  }

  getChannel() {
    return this.channel;
  }

  onModuleInit() {
    this.initialize();
  }

  private initialize() {
    this.connection = amqp.connect(this.options.url);
    this.connection
      .on('connected', () => {
        this.logger.log('RabbitMQ connected');
      })
      .on('connectFailed', (err) => {
        this.logger.log('RabbitMQ connection failed', err);
      })
      .on('blocked', () => {
        this.logger.log('RabbitMQ connection blocked');
      })
      .on('disconnect', () => {
        this.logger.log('RabbitMQ connection closed');
      });
    this.channel = this.connection.createChannel({
      setup: (channel: Channel) => {
        channel
          .assertQueue(this.options.queue)
          .then(() => {
            this.logger.log(`RabbitMQ queue [${this.options.queue}] asserted`);
          })
          .catch((err) => {
            this.logger.error('RabbitMQ queue assertion error', err);
          });
      },
    });
  }

  consume(callback: XRayQueueCallback) {
    void this.channel.consume(
      this.options.queue,
      (message) => void this.handleQueueMessage(message, callback),
    );
  }

  private async handleQueueMessage(
    message: ConsumeMessage,
    callback: XRayQueueCallback,
  ) {
    if (message === null) {
      // cancelled by server
      return false;
    }

    let payload: XRayPayload;
    try {
      payload = JSON.parse(message.content.toString()) as XRayPayload;
    } catch (err) {
      this.logger.error('Error parsing message content', err);
      return false;
    }
    try {
      await callback(payload);
      this.channel.ack(message);
    } catch (err) {
      this.logger.error('Error handling message', err);
      return false;
    }

    return true;
  }

  async publish(message: string) {
    this.logger.debug(`Publishing message ${message}`);
    const done = await this.channel.sendToQueue(
      this.options.queue,
      Buffer.from(message),
      { persistent: true },
    );
    this.logger.debug(`Published message: ${done}`);
    return done;
  }
}
