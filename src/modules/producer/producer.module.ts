import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { ProducerService } from './services/producer.service';
import { DEFAULT_QUEUE_NAME } from '../../constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get(
          'RABBITMQ_URL',
          'amqp://admin:password@localhost:5672',
        ),
        queue: DEFAULT_QUEUE_NAME,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ProducerService],
})
export class ProducerModule {}
