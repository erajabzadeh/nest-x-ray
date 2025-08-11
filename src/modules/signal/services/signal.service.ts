import Rx from 'rxjs';
import { RabbitMQChannel } from '../../rabbitmq/providers/rabbitmq-channel.provider';

export class SignalService {
  constructor(readonly channel: RabbitMQChannel) {
    channel.consumer<{ time: number }>().pipe(Rx.map((x) => console.log(x)));
  }
}
