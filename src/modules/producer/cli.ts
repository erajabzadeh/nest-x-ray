import { CommandFactory } from 'nest-commander';
import { ProducerModule } from './producer.module';

async function bootstrap() {
  console.log('args', process.argv);
  await CommandFactory.run(ProducerModule);
}

void bootstrap();
