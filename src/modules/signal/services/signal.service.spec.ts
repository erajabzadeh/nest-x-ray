import { vi } from 'vitest';
import { createMock } from '@golevelup/ts-vitest';

import { SignalService } from './signal.service';
import {
  RabbitMQService,
  type XRayPayload,
} from '../../rabbitmq/services/rabbitmq.service';
import { Model } from 'mongoose';
import { XRay } from '../schemas/x-ray.schema';

describe('SignalService', () => {
  let signalService: SignalService;

  describe('transform', () => {
    beforeEach(() => {
      signalService = new SignalService(
        createMock<RabbitMQService>(),
        createMock<Model<XRay>>(),
      );
    });

    it('transforms one device, empty data', () => {
      const payload: Readonly<XRayPayload> = {
        device1: {
          data: [],
          time: 1234,
        },
      };

      const result = signalService.transform(payload);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        deviceId: 'device1',
        dataLength: 0,
        dataVolume: [],
        time: 1234,
      });
    });

    it('transforms one device, data.length=1', () => {
      const payload: Readonly<XRayPayload> = {
        device1: {
          data: [[123, [23, 34, 454]]],
          time: 1234,
        },
      };

      const result = signalService.transform(payload);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        deviceId: 'device1',
        dataLength: payload['device1'].data.length,
        dataVolume: payload['device1'].data,
        time: 1234,
      });
    });

    it('transforms one device, data.length>1', () => {
      const payload: Readonly<XRayPayload> = {
        device1: {
          data: [
            [123, [23, 34, 454]],
            [1, [2, 3, 4]],
          ],
          time: 1234,
        },
      };

      const result = signalService.transform(payload);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        deviceId: 'device1',
        dataLength: payload['device1'].data.length,
        dataVolume: payload['device1'].data,
        time: 1234,
      });
    });

    it('transforms multiple devices, data.length>1', () => {
      const payload: Readonly<XRayPayload> = {
        device1: {
          data: [[1, [2, 3, 4]]],
          time: 1234,
        },
        device2: {
          data: [[10, [21, 31, 41]]],
          time: 1234,
        },
      };

      const result = signalService.transform(payload);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        deviceId: 'device1',
        dataLength: payload['device1'].data.length,
        dataVolume: payload['device1'].data,
        time: 1234,
      });
      expect(result[1]).toEqual({
        deviceId: 'device2',
        dataLength: payload['device2'].data.length,
        dataVolume: payload['device2'].data,
        time: 1234,
      });
    });
  });

  describe('upsert', () => {
    const mockModel = createMock<Model<XRay>>({
      updateOne: vi.fn().mockReturnValue({
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 1,
      }),
    });

    beforeEach(() => {
      signalService = new SignalService(
        createMock<RabbitMQService>(),
        mockModel,
      );
    });

    it('inserts new data', async () => {
      const xray: XRay = {
        deviceId: 'device1',
        dataLength: 1,
        dataVolume: [[123, [23, 34, 454]]],
        time: 1234,
      };

      const result = await signalService.upsert(xray);

      expect(result).toBe(1);
    });

    it.each([
      { deviceId: undefined }, //
      { deviceId: null },
      { deviceId: '' },
      { deviceId: ' ' },
    ])(
      'throws with invalid input deviceId ($deviceId)',
      async ({ deviceId }) => {
        const xray = Object.assign(
          {
            deviceId: 'device1',
            dataLength: 1,
            dataVolume: [[123, [23, 34, 454]]],
            time: 1234,
          },
          { deviceId },
        ) as XRay;

        const result = signalService.upsert(xray);

        await expect(result).rejects.toThrow('Invalid deviceId');
      },
    );

    it.each([
      { time: undefined }, //
      { time: null },
      { time: NaN },
      { time: 0 },
      { time: -1 },
      { time: 1.23 },
      { time: Infinity },
      { time: '' },
      { time: {} },
    ])('throws with invalid input time ($time)', async ({ time }) => {
      const xray = Object.assign(
        {
          deviceId: 'device1',
          dataLength: 1,
          dataVolume: [[123, [23, 34, 454]]],
          time: 1234,
        },
        { time },
      ) as XRay;

      const result = signalService.upsert(xray);

      await expect(result).rejects.toThrow('Invalid time');
    });
  });

  describe('initialization', () => {
    const mockRabbitMQService = createMock<RabbitMQService>({
      consume: vi.fn(),
    });

    beforeEach(() => {
      signalService = new SignalService(
        mockRabbitMQService,
        createMock<Model<XRay>>(),
      );
    });

    it('starts queue consume on module initialization', () => {
      signalService.onModuleInit();

      expect(mockRabbitMQService.consume).toHaveBeenCalledTimes(1);
    });
  });
});
