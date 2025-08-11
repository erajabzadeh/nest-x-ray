import { NestFactory } from '@nestjs/core';
import { parseArgs } from 'node:util';
import { ProducerModule } from './producer.module';
import { ProducerService } from './services/producer.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ProducerModule);
  const {
    positionals: [count],
  } = parseArgs({ allowPositionals: true });
  await app.get(ProducerService).produce(parseInt(count, 10) || 1);
  await app.close();
}

bootstrap()
  .catch((err) => console.error(err))
  .finally(() => process.exit());
