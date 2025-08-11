import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import amqp from 'amqp-connection-manager';

import { MODULE_OPTIONS_TOKEN } from '../rabbitmq.module-definition';
import type { RabbitMQModuleOptions } from '../interfaces/rabbitmq-module-options.interface';

@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnModuleDestroy {
  private readonly connection: ReturnType<typeof amqp.connect>;
  private readonly logger = new Logger(RabbitMQConnection.name);

  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: RabbitMQModuleOptions) {
    this.connection = amqp.connect(options.url);
  }

  onModuleInit() {
    this.connection
      .on('connect', () => {
        this.logger.log('RabbitMQ connected');
      })
      .on('connectFailed', (err) => {
        this.logger.error('RabbitMQ connection failed', err);
      })
      .on('disconnect', (err) => {
        this.logger.log('RabbitMQ disconnected', err);
      });
  }

  async onModuleDestroy() {
    await this.connection
      ?.close()
      .then(() => this.logger.log('RabbitMQ connection closed'));
  }

  get instance() {
    return this.connection;
  }
}
