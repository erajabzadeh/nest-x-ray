/* eslint-disable @typescript-eslint/unbound-method */
import { vi } from 'vitest';
import { createMock } from '@golevelup/ts-vitest';
import {
  ChannelWrapper,
  type AmqpConnectionManager,
} from 'amqp-connection-manager';

import { RabbitMQService, type XRayQueueCallback } from './rabbitmq.service';

vi.mock('amqp-connection-manager', () => ({
  connect: vi.fn().mockReturnValue(
    createMock<AmqpConnectionManager>({
      createChannel: () =>
        createMock<ChannelWrapper>({
          sendToQueue: vi.fn().mockReturnValue(true),
        }),
    }),
  ),
}));

describe('RabbitMQService', () => {
  let rabbitMQService: RabbitMQService;

  describe('initialization', () => {
    beforeEach(() => {
      rabbitMQService = new RabbitMQService({
        url: 'amqp://localhost',
        queue: 'test-queue',
      });
    });

    it('initializes connection and channel', () => {
      rabbitMQService.onModuleInit();

      expect(rabbitMQService.getConnection()).toBeDefined();
      expect(rabbitMQService.getChannel()).toBeDefined();
    });
  });

  describe('consume', () => {
    beforeEach(() => {
      rabbitMQService = new RabbitMQService({
        url: 'amqp://localhost',
        queue: 'test-queue',
      });
      rabbitMQService.onModuleInit();
    });

    it('creates message subscription on queue channel', () => {
      const channel = rabbitMQService.getChannel();
      const callback = vi.fn<XRayQueueCallback>();

      rabbitMQService.consume(callback);

      expect(channel.consume).toHaveBeenCalledTimes(1);
      expect(channel.consume).toHaveBeenCalledWith(
        'test-queue',
        expect.anything(),
      );
    });
  });

  describe('publish', () => {
    beforeEach(() => {
      rabbitMQService = new RabbitMQService({
        url: 'amqp://localhost',
        queue: 'test-queue',
      });
      rabbitMQService.onModuleInit();
    });

    it('sends message to queue', async () => {
      const channel = rabbitMQService.getChannel();
      const message = JSON.stringify({
        a: 1,
        b: 'BBB',
        c: ['C C'],
        d: null,
        e: {},
        f: Math.PI,
      });

      const result = await rabbitMQService.publish(message);

      expect(result).toEqual(true);
      expect(channel.sendToQueue).toHaveBeenCalledTimes(1);
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'test-queue',
        Buffer.from(message),
        { persistent: true },
      );
    });
  });
});
