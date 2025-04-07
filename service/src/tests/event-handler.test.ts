// High-level tests for the event handler
import request from 'supertest';
import app from '../app';
import { createApiRoot } from '../client/create.client';
import { Analytics } from '@segment/analytics-node';
import { Order } from '@commercetools/platform-sdk';
import * as testOrder from '../lib/test-orders/order-with-us-tax.json';
import fetchMock from 'jest-fetch-mock';
import * as orderWithConsentField from '../lib/test-orders/order-with-consent-field.json';

jest.mock('../client/create.client');
jest.mock('@segment/analytics-node');
jest.mock('../utils/config.utils');

fetchMock.enableMocks();

const mockIdentify = jest.fn();
const mockTrack = jest.fn();

const mockGetCustomerCustomerFound = jest.fn().mockResolvedValue({
  body: {
    id: '871ebaf7-736d-4fc4-9782-4c25101df9f7',
    email: 'test@example.com',
  },
});

const mockGetCustomerNoCustomerFound = jest.fn().mockResolvedValue({
  body: {
    results: [],
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.resetMocks();

  (Analytics as jest.Mock).mockImplementation(() => ({
    identify: mockIdentify,
    track: mockTrack,
  }));
});

it('should handle customer created event', async () => {
  (createApiRoot as jest.Mock).mockReturnValue({
    customers: () => ({
      withId: () => ({
        get: () => ({ execute: mockGetCustomerCustomerFound }),
      }),
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

it('should handle customer updated event', async () => {
  (createApiRoot as jest.Mock).mockReturnValue({
    customers: () => ({
      withId: () => ({
        get: () => ({ execute: mockGetCustomerCustomerFound }),
      }),
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
            version: 2,
            notificationType: 'ResourceUpdated',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(mockIdentify).toHaveBeenCalled();
});

it('should handle customer deleted event', async () => {
  const customerId = '871ebaf7-736d-4fc4-9782-4c25101df9f7';

  fetchMock.mockResponseOnce(
    JSON.stringify({ regulateId: 'regulate-id-123' }),
    { status: 200 }
  );

  await request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: {
              typeId: 'customer',
              id: customerId,
            },
            notificationType: 'ResourceDeleted',
          })
        ).toString('base64'),
      },
    })
    .expect(204);

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.segmentapis.com/regulations',
    expect.objectContaining({
      method: 'POST',
      headers: {
        Authorization: expect.stringContaining('Bearer'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        regulationType: 'SUPPRESS_WITH_DELETE',
        subjectType: 'USER_ID',
        subjectIds: [customerId],
      }),
    })
  );
});

it('should track order created event for registered user', async () => {
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: testOrder as Order,
  });

  setupApiRootMock(mockGetOrder, mockGetCustomerCustomerFound);

  await postOrderCreatedEvent('33925a10-c3fb-4ff5-a9b2-9134400b9d4d').expect(
    204
  );

  expect(mockTrack).toHaveBeenCalled();
});

it('should not track order created event for order with no customerId or anonymousId', async () => {
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: {
      ...testOrder,
      customerId: undefined,
      anonymousId: undefined,
    } as Partial<Order>,
  });

  setupApiRootMock(mockGetOrder, mockGetCustomerCustomerFound);

  await postOrderCreatedEvent('33925a10-c3fb-4ff5-a9b2-9134400b9d4d').expect(
    204
  );

  expect(mockTrack).not.toHaveBeenCalled();
});

it('should identify customer for anonymous order when no registered customer exists with matching email', async () => {
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: {
      ...testOrder,
      customerId: undefined,
      anonymousId: '2a5c1992-4380-4ca2-b679-64a613bd6df8',
      customerEmail: 'nonexistent@example.com',
    } as Partial<Order>,
  });

  setupApiRootMock(mockGetOrder, mockGetCustomerNoCustomerFound);

  await postOrderCreatedEvent('33925a10-c3fb-4ff5-a9b2-9134400b9d4d').expect(
    204
  );

  expect(mockIdentify).toHaveBeenCalledWith({
    anonymousId: '2a5c1992-4380-4ca2-b679-64a613bd6df8',
    traits: { email: 'nonexistent@example.com' },
  });
});

it('anonymous order with consent field and no registered customer should pass consent to Segment', async () => {
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: {
      ...orderWithConsentField,
      customerId: undefined,
      anonymousId: '2a5c1992-4380-4ca2-b679-64a613bd6df8',
      customerEmail: 'nonexistent@example.com',
    } as Partial<Order>,
  });

  setupApiRootMock(mockGetOrder, mockGetCustomerNoCustomerFound);

  await postOrderCreatedEvent('33925a10-c3fb-4ff5-a9b2-9134400b9d4d').expect(
    204
  );

  expect(mockIdentify).toHaveBeenCalledWith(
    expect.objectContaining({
      context: {
        consent: {
          categoryPreferences: {
            Advertising: true,
            Analytics: false,
            Functional: true,
            DataSharing: false,
          },
        },
      },
    })
  );
});

it('should not identify customer for anonymous order when a registered customer exists with matching email', async () => {
  const email = 'existing@example.com';
  const mockGetOrder = jest.fn().mockResolvedValue({
    body: {
      ...testOrder,
      customerId: undefined,
      anonymousId: '2a5c1992-4380-4ca2-b679-64a613bd6df8',
      customerEmail: email,
    } as Partial<Order>,
  });

  // Customer found with matching email
  const mockGetCustomer = jest.fn().mockResolvedValue({
    body: {
      results: [
        {
          id: 'dd732793-9294-4a51-97e2-d4197f91c97b',
          email: email,
        },
      ],
    },
  });

  setupApiRootMock(mockGetOrder, mockGetCustomer);

  await postOrderCreatedEvent('33925a10-c3fb-4ff5-a9b2-9134400b9d4d').expect(
    204
  );

  expect(mockIdentify).not.toHaveBeenCalled();
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

test('should return 400 for empty body', async () => {
  const response = await request(app).post('/');
  expect(response.status).toBe(400);
});

test('should return 400 for invalid body', async () => {
  const response = await request(app).post('/').send({
    message: 'hello world',
  });
  expect(response.status).toBe(400);
});

test('should return 400 for empty body', async () => {
  const response = await request(app)
    .post('/')
    .send({
      message: {
        data: null,
      },
    });
  expect(response.status).toBe(400);
});

const postOrderCreatedEvent = (orderId: string) => {
  return request(app)
    .post('/')
    .send({
      message: {
        data: Buffer.from(
          JSON.stringify({
            resource: {
              typeId: 'order',
              id: orderId,
            },
            notificationType: 'ResourceCreated',
          })
        ).toString('base64'),
      },
    });
};

const setupApiRootMock = (
  mockGetOrder: jest.Mock,
  mockGetCustomer: jest.Mock
) => {
  (createApiRoot as jest.Mock).mockReturnValue({
    orders: () => ({
      withId: () => ({ get: () => ({ execute: mockGetOrder }) }),
    }),
    customers: () => ({
      get: () => ({ execute: mockGetCustomer }),
    }),
  });
};
