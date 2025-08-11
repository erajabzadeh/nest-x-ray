import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqp-connection-manager';
import type { ConsumeMessage } from 'amqplib';

import { MODULE_OPTIONS_TOKEN } from '../rabbitmq.module-definition';
import { type RabbitMQModuleOptions } from '../interfaces/rabbitmq-module-options.interface';

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

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.AmqpConnectionManager;
  private channel: amqp.ChannelWrapper;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: RabbitMQModuleOptions,
  ) {}

  async onModuleInit() {
    this.initializeConnection();
    await this.setupQueues();
  }

  private initializeConnection() {
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
    this.channel = this.connection.createChannel();
  }

  private async setupQueues() {
    const queue = this.options.queue;
    await this.channel.assertQueue(queue, { durable: true });
    this.logger.log(`Queue ${queue} ensured`);
  }

  consume(callback: (payload: XRayPayload) => Promise<void>) {
    const handleMessage = (message: ConsumeMessage) => {
      if (message === null) {
        // cancelled by server
        return;
      }

      try {
        const payload = JSON.parse(message.content.toString()) as XRayPayload;
        void callback(payload)
          .then(() => {
            this.channel.ack(message);
          })
          .catch((err) => {
            this.logger.error('Error handling message', err);
          });
      } catch (err) {
        this.logger.error('Error parsing message content', err);
      }
    };

    void this.channel.consume(this.options.queue, handleMessage);
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
