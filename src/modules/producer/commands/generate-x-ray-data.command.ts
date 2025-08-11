import { Command, CommandRunner } from 'nest-commander';
import { RabbitMQChannel } from '../../rabbitmq/providers/rabbitmq-channel.provider';

@Command({ name: 'generate', description: 'generate random x-ray data' })
export class GenerateXRayDataCommand extends CommandRunner {
  constructor(private readonly channel: RabbitMQChannel) {
    super();
  }

  async run(params: string[]) {
    console.log('params', params);
  }
}
