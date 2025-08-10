import { Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './rabbitmq.module-definition';
import { CHANNEL_PROVIDER } from './tokens';
import amqp from 'amqp-connection-manager';
import { RabbitMQModuleOptions } from './interfaces/rabbitmq-module-options.interface';

@Module({
  providers: [
    {
      provide: CHANNEL_PROVIDER,
      useFactory: async (options: RabbitMQModuleOptions) => {
        const connection = amqp.connect(options.url);
        connection.on('connect', () => {
          console.log('Connected to RabbitMQ');
        });

        connection.on('disconnect', (err) => {
          console.log('Disconnected from RabbitMQ:', err);
        });

        connection.on('connectFailed', (err) => {
          console.error('Failed to connect to RabbitMQ:', err);
        });

        const wrapper = connection.createChannel({ json: true });
        await wrapper.waitForConnect();
        const ass = await wrapper.assertQueue(options.queue);
        console.log({ ass });
        console.log(connection.channelCount);
        return wrapper;
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [CHANNEL_PROVIDER],
})
export class RabbitMQModule extends ConfigurableModuleClass {}
