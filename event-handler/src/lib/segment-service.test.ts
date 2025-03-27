import { Analytics } from '@segment/analytics-node';
import {
  identifyAnonymousCustomer,
  identifyCustomer,
  trackOrderCompleted,
} from './segment-service';
import * as orderWithUSTax from './test-orders/order-with-us-tax.json';
import * as anonymousOrderWithShippingDiscount from './test-orders/anonymous-order-shipping-discount.json';
import { Order } from '@commercetools/platform-sdk';

jest.mock('@segment/analytics-node');
jest.mock('../utils/config.utils');

describe('sendCustomer', () => {
  const mockIdentify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));
  });

  it('should send customer data to Segment', async () => {
    const mockCustomer = createMockCustomer({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'middle',
      title: 'Mr',
      dateOfBirth: '1990-11-01',
      customerNumber: 'CN123',
      externalId: 'EXT123',
      isEmailVerified: true,
      locale: 'en-US',
    });

    identifyCustomer(mockCustomer);

    expect(mockIdentify).toHaveBeenCalledWith({
      userId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
      messageId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c-2',
      timestamp: '2023-02-01T12:00:00.000Z',
      traits: {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        title: 'Mr',
        dateOfBirth: '1990-11-01',
        customerNumber: 'CN123',
        externalId: 'EXT123',
        isEmailVerified: true,
        locale: 'en-US',
        createdAt: '2023-01-01T12:00:00.000Z',
      },
    });
  });

  it('should handle missing customer properties gracefully', async () => {
    const mockCustomer = createMockCustomer();

    identifyCustomer(mockCustomer);

    expect(mockIdentify).toHaveBeenCalledWith({
      userId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
      messageId: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c-2',
      timestamp: '2023-02-01T12:00:00.000Z',
      traits: {
        email: 'test@example.com',
        createdAt: '2023-01-01T12:00:00.000Z',
        firstName: undefined,
        lastName: undefined,
        title: undefined,
        dateOfBirth: undefined,
        customerNumber: undefined,
        externalId: undefined,
        isEmailVerified: false,
        locale: undefined,
      },
    });
  });

  it('should throw an error when Segment API fails', async () => {
    const segmentError = new Error('Segment API failure');

    mockIdentify.mockImplementation(() => {
      throw segmentError;
    });

    const mockCustomer = createMockCustomer();

    expect(() => identifyCustomer(mockCustomer)).toThrow(segmentError);
  });
});

describe('identifyAnonymousUser', () => {
  const mockIdentify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));
  });

  it('should identify an anonymous user with provided anonymousId and email', async () => {
    const anonymousId = '550e8400-e29b-41d4-a716-446655440000';
    const email = 'anonymous@example.com';

    await identifyAnonymousCustomer(anonymousId, email);

    expect(mockIdentify).toHaveBeenCalledWith({
      anonymousId,
      traits: { email },
    });
  });

  it('should throw an error when Segment API fails', async () => {
    const segmentError = new Error('Segment API failure');
    mockIdentify.mockImplementation(() => {
      throw segmentError;
    });

    const anonymousId = '550e8400-e29b-41d4-a716-446655440002';
    const email = 'anonymous@example.com';

    await expect(identifyAnonymousCustomer(anonymousId, email)).rejects.toThrow(
      segmentError
    );
  });
});

const createMockCustomer = (overrides = {}) => ({
  id: '762a5ae5-e8c8-47c2-8af2-0dd7024d0f7c',
  version: 2,
  lastModifiedAt: '2023-02-01T12:00:00.000Z',
  email: 'test@example.com',
  createdAt: '2023-01-01T12:00:00.000Z',
  addresses: [],
  isEmailVerified: false,
  stores: [],
  customerGroupAssignments: [],
  password: '****2Zk=',
  authenticationMode: 'password',
  ...overrides,
});

describe('trackOrderCompleted', () => {
  const mockTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      track: mockTrack,
    }));
  });

  it('order with US Tax tracked correctly', () => {
    const order = orderWithUSTax as Order;

    trackOrderCompleted(order);

    expect(mockTrack).toHaveBeenCalledWith({
      event: 'Order Completed',
      userId: 'e3b424f5-0d5c-419d-b067-32cd70b13a89',
      anonymousId: undefined,
      timestamp: '2025-02-03T10:29:22.895Z',
      messageId: '33925a10-c3fb-4ff5-a9b2-9134400b9d4d-order-completed',
      properties: {
        email: 'seb@example.com',
        order_id: '33925a10-c3fb-4ff5-a9b2-9134400b9d4d',
        total: 169.8,
        revenue: 119.8,
        shipping: 50.0,
        subtotal: 119.8,
        tax: 8.07,
        discount: 0,
        coupon: undefined,
        products: [
          {
            product_id: 'b5241ecf-537f-4714-acaf-a0c36b20a74d',
            sku: 'FLAS-094',
            price: 5.99,
            quantity: 20,
            image_url:
              'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Steel_Hip_Flask-1.1.jpeg',
            position: 1,
          },
        ],
        currency: 'USD',
      },
    });
  });

  it('anonymous order with shipping discount tracked correctly', () => {
    const order = anonymousOrderWithShippingDiscount as Order;

    trackOrderCompleted(order);

    expect(mockTrack).toHaveBeenCalledWith({
      event: 'Order Completed',
      userId: undefined,
      anonymousId: 'jzimle22wy3yjwief722l7r7',
      timestamp: '2025-03-26T16:05:23.415Z',
      messageId: '6fb68079-06fd-4bd4-bff1-b790d275f996-order-completed',
      properties: {
        email: 'anon401@example.com',
        order_id: '6fb68079-06fd-4bd4-bff1-b790d275f996',
        total: 169.0,
        revenue: 79.0,
        shipping: 90.0,
        subtotal: 79.0,
        tax: 28.17,
        discount: 10.0,
        coupon: undefined,
        products: [
          {
            product_id: '600bf085-00fa-47a8-88d3-e615ec6d9d71',
            sku: 'CNS-0434',
            price: 79.0,
            quantity: 1,
            image_url:
              'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Minimalist_Cedar_Nightstand-1.3.jpeg',
            position: 1,
          },
        ],
        currency: 'GBP',
      },
    });
  });
});
