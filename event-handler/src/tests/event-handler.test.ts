// High-level tests for the event handler
import request from 'supertest';
import app from '../app';
import { createApiRoot } from '../client/create.client';
import { Analytics } from '@segment/analytics-node';
import { Order } from '@commercetools/platform-sdk';
import * as testOrder from '../lib/test-orders/order-with-us-tax.json';

jest.mock('../client/create.client');
jest.mock('@segment/analytics-node');

const mockIdentify = jest.fn();
const mockTrack = jest.fn();

const mockGetCustomer = jest.fn().mockResolvedValue({
  body: {
    id: '871ebaf7-736d-4fc4-9782-4c25101df9f7',
    email: 'test@example.com',
  },
});

beforeEach(() => {
  jest.clearAllMocks();

  (Analytics as jest.Mock).mockImplementation(() => ({
    identify: mockIdentify,
    track: mockTrack,
  }));
});

it('should handle customer ResourceCreated event', async () => {
  (createApiRoot as jest.Mock).mockReturnValue({
    customers: () => ({
      withId: () => ({ get: () => ({ execute: mockGetCustomer }) }),
    }),
  });

  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: {
              typeId: 'customer',
              id: '871ebaf7-736d-4fc4-9782-4c25101df9f7',
            },
            version: 1,
            notificationType: 'ResourceCreated',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(mockIdentify).toHaveBeenCalled();
});

it('should handle order created event for registered user', async () => {
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: testOrder as Order,
  });

  (createApiRoot as jest.Mock).mockReturnValue({
    orders: () => ({
      withId: () => ({ get: () => ({ execute: mockGetOrder }) }),
    }),
    customers: () => ({
      withId: () => ({ get: () => ({ execute: mockGetCustomer }) }),
    }),
  });

  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: { typeId: 'order', id: 'order-id-789' },
            notificationType: 'ResourceCreated',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(mockTrack).toHaveBeenCalled();
});

it('should ignore unsupported resource types', async () => {
  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: { typeId: 'unsupported', id: 'resource-id' },
            notificationType: 'ResourceCreated',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(createApiRoot).not.toHaveBeenCalled();
});

it('should ignore unsupported notification types', async () => {
  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: { typeId: 'customer', id: 'customer-id-123' },
            notificationType: 'UnsupportedType',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(createApiRoot).not.toHaveBeenCalled();
});
