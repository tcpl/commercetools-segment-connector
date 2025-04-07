import { Analytics } from '@segment/analytics-node';
import {
  identifyAnonymousCustomer,
  identifyCustomer,
  trackOrderCompleted,
} from './segment-analytics-service';
import * as orderWithUSTax from './test-orders/order-with-us-tax.json';
import * as orderWithShippingDiscount from './test-orders/order-with-shipping-discount.json';
import * as orderWithDiscountOnTotalPrice from './test-orders/order-with-discount-on-total-price.json';
import * as orderWithItemDiscount from './test-orders/order-with-item-discount.json';
import * as orderWithProductDiscount from './test-orders/order-with-product-discount.json';
import * as orderWithTotalPriceDiscountLargerThanItemTotal from './test-orders/order-with-total-price-discount-larger-than-item-total.json';
import * as anonymousOrderWithNoDiscounts from './test-orders/anonymous-order-with-no-discounts.json';
import * as orderWithUSTaxAndItemDiscount from './test-orders/order-with-us-tax-item-discount.json';
import * as orderWithUSTaxAndMultiBuyDiscount from './test-orders/order-with-us-tax-multi-buy-discount.json';
import * as orderWithUSTaxItemAndProductDiscount from './test-orders/order-with-us-tax-item-and-product-discount.json';
import * as orderWithMultipleShippingMethods from './test-orders/order-with-multiple-shipping-methods.json';
import * as orderWithMultipleShippingMethodsAndShippingDiscount from './test-orders/order-with-multiple-shipping-methods-and-shipping-discount.json';
import * as orderWithUSTaxAndShippingDiscount from './test-orders/order-with-us-tax-and-shipping-discount.json';
import * as orderWithUSTaxAndDiscountOnTotalPrice from './test-orders/order-with-us-tax-and-discount-on-total-price.json';
import * as orderWithDiscountCode from './test-orders/order-with-discount-code.json';
import * as orderWithNoShippingInfo from './test-orders/order-with-no-shipping-info.json';
import * as orderWithConsentField from './test-orders/order-with-consent-field.json';
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

    mockIdentify.mockImplementation((_params, callback) => {
      if (callback) {
        callback(null); // Simulate success
      }
    });
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

    await identifyCustomer(mockCustomer);

    expect(mockIdentify.mock.calls[0][0]).toEqual({
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

    await identifyCustomer(mockCustomer);

    expect(mockIdentify.mock.calls[0][0]).toEqual({
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

  it('customer with consent field should pass consent to Segment', async () => {
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
      custom: {
        type: {
          typeId: 'type',
          id: '8b37d6b9-8eb5-4b2e-a743-b74751c379ca',
        },
        fields: {
          consent:
            '{"categoryPreferences":{"Advertising":true,"Analytics":false,"Functional":true,"DataSharing":false}}',
        },
      },
    });

    await identifyCustomer(mockCustomer);

    expect(mockIdentify.mock.calls[0][0]).toEqual(
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

  it('should throw an error when Segment API fails', async () => {
    mockIdentify.mockImplementation((_params, callback) => {
      if (callback) {
        callback(new Error('test error'));
      }
    });

    const mockCustomer = createMockCustomer();

    expect(async () => await identifyCustomer(mockCustomer)).rejects.toThrow();
  });
});

describe('identifyAnonymousUser', () => {
  const mockIdentify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (Analytics as jest.Mock).mockImplementation(() => ({
      identify: mockIdentify,
    }));

    mockIdentify.mockImplementation((_params, callback) => {
      if (callback) {
        callback(null); // Simulate success
      }
    });
  });

  it('should identify an anonymous user with provided anonymousId and email', async () => {
    const anonymousId = '550e8400-e29b-41d4-a716-446655440000';
    const email = 'anonymous@example.com';

    await identifyAnonymousCustomer(anonymousId, email);

    expect(mockIdentify.mock.calls[0][0]).toEqual({
      anonymousId,
      traits: { email },
    });
  });

  // it('should throw an error when Segment API fails', async () => {
  //   const segmentError = new Error('Segment API failure');

  //   mockIdentify.mockImplementation(() => {
  //     throw segmentError;
  //   });

  //   const anonymousId = '550e8400-e29b-41d4-a716-446655440002';
  //   const email = 'anonymous@example.com';

  //   expect(() => identifyAnonymousCustomer(anonymousId, email)).toThrow(
  //     segmentError
  //   );
  // });
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

    mockTrack.mockImplementation((_params, callback) => {
      if (callback) {
        callback(null); // Simulate success
      }
    });
  });

  it('order with US Tax tracked correctly', async () => {
    const order = orderWithUSTax as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual({
      event: 'Order Completed',
      userId: 'e3b424f5-0d5c-419d-b067-32cd70b13a89',
      anonymousId: undefined,
      timestamp: '2025-02-03T10:29:22.895Z',
      messageId: '33925a10-c3fb-4ff5-a9b2-9134400b9d4d-order-completed',
      properties: {
        email: 'seb@example.com',
        order_id: '33925a10-c3fb-4ff5-a9b2-9134400b9d4d',
        subtotal: 119.8,
        shipping: 52.38,
        tax: 8.07,
        discount: 0,
        coupon: undefined,
        total: 177.87,
        products: [
          {
            product_id: 'b5241ecf-537f-4714-acaf-a0c36b20a74d',
            sku: 'FLAS-094',
            price: 5.99,
            total_price: 119.8,
            quantity: 20,
            name: 'Steel Hip Flask',
            image_url:
              'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Steel_Hip_Flask-1.1.jpeg',
            position: 1,
          },
        ],
        currency: 'USD',
      },
    });
  });

  it('order with shipping discount tracked correctly', async () => {
    const order = orderWithShippingDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual({
      event: 'Order Completed',
      userId: undefined,
      anonymousId: 'af71da5e-28bd-4059-8b06-cfe3c513274e',
      timestamp: '2025-03-26T16:05:23.415Z',
      messageId: '6fb68079-06fd-4bd4-bff1-b790d275f996-order-completed',
      properties: {
        email: 'anon401@example.com',
        order_id: '6fb68079-06fd-4bd4-bff1-b790d275f996',
        subtotal: 65.83,
        shipping: 90.0,
        tax: 28.17,
        discount: 10.0,
        total: 169.0,
        coupon: undefined,
        products: [
          {
            product_id: '600bf085-00fa-47a8-88d3-e615ec6d9d71',
            sku: 'CNS-0434',
            price: 79.0,
            total_price: 79.0,
            quantity: 1,
            name: 'Minimalist Cedar Nightstand',
            image_url:
              'https://storage.googleapis.com/merchant-center-europe/sample-data/b2c-lifestyle/Minimalist_Cedar_Nightstand-1.3.jpeg',
            position: 1,
          },
        ],
        currency: 'GBP',
      },
    });
  });

  it('order with discount on total price tracked correctly', async () => {
    const order = orderWithDiscountOnTotalPrice as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 59.24,
          shipping: 90.0,
          tax: 26.86,
          discount: 17.9,
          total: 161.1,
        }),
      })
    );
  });

  it('order with total price discount larger than item total tracked correctly', async () => {
    const order = orderWithTotalPriceDiscountLargerThanItemTotal as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 13.06,
          shipping: 60.31,
          tax: 12.67,
          discount: 50.0,
          total: 75.99,
        }),
      })
    );
  });

  it('order with item discount tracked correctly', async () => {
    const order = orderWithItemDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 3.12,
          shipping: 100.0,
          tax: 17.29,
          discount: 1.25,
          total: 103.74,
        }),
      })
    );
  });

  it('order with product discount tracked correctly', async () => {
    const order = orderWithProductDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 282.62,
          shipping: 0,
          tax: 56.53,
          discount: 0,
          total: 339.15,
        }),
      })
    );
  });

  it('anonymous order with no discounts tracked correctly', async () => {
    const order = anonymousOrderWithNoDiscounts as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 65.83,
          shipping: 100,
          tax: 29.84,
          discount: 0,
          total: 179.0,
        }),
      })
    );
  });

  it('order with US tax and item discount tracked correctly', async () => {
    const order = orderWithUSTaxAndItemDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 172.47,
          shipping: 50,
          tax: 42.83,
          discount: 69,
          total: 256.97,
        }),
      })
    );
  });

  it('order with US tax and multi-buy discount tracked correctly', async () => {
    const order = orderWithUSTaxAndMultiBuyDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 380.84,
          shipping: 50,
          tax: 84.49,
          discount: 79,
          total: 507.0,
        }),
      })
    );
  });

  it('order with US tax, item discount, and product discount tracked correctly', async () => {
    const order = orderWithUSTaxItemAndProductDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 228.21,
          shipping: 50,
          tax: 53.97,
          discount: 91.29,
          total: 323.85,
        }),
      })
    );
  });

  it('order with multiple shipping methods tracked correctly', async () => {
    const order = orderWithMultipleShippingMethods as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 280.66,
          shipping: 500,
          tax: 133.16,
          discount: 0,
          total: 833.99,
        }),
      })
    );
  });

  it('order with multiple shipping methods and shipping discount tracked correctly', async () => {
    const order = orderWithMultipleShippingMethodsAndShippingDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 280.66,
          shipping: 450,
          tax: 125.18,
          discount: 50,
          total: 783.99,
        }),
      })
    );
  });

  it('order with US tax and shipping discount tracked correctly', async () => {
    const order = orderWithUSTaxAndShippingDiscount as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 208.33,
          shipping: 45,
          tax: 49.17,
          discount: 5,
          total: 295.0,
        }),
      })
    );
  });

  it('order with US tax and discount on total price tracked correctly', async () => {
    const order = orderWithUSTaxAndDiscountOnTotalPrice as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          subtotal: 40.31,
          shipping: 30.62,
          tax: 13.17,
          discount: 50,
          total: 79.0,
        }),
      })
    );
  });

  it('should throw an error if taxedPrice is missing', async () => {
    const order = {
      ...anonymousOrderWithNoDiscounts,
      taxedPrice: undefined,
    } as Order;

    await expect(() => trackOrderCompleted(order)).rejects.toThrow(
      `Order ${order.id} is missing taxedPrice`
    );
  });

  it('should export discount code if available', async () => {
    const order = orderWithDiscountCode as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          coupon: 'BOGO',
        }),
      })
    );
  });

  it('order with no shippingInfo should have a shipping cost of 0', async () => {
    const order = orderWithNoShippingInfo as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          shipping: 0,
        }),
      })
    );
  });

  it('order with consent field should pass consent to Segment', async () => {
    const order = orderWithConsentField as Order;

    await trackOrderCompleted(order);

    expect(mockTrack.mock.calls[0][0]).toEqual(
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
});
