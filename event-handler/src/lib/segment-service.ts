import { Analytics, TrackParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import { Customer, Order } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';

const createAnalytics = () => {
  const configuration = readConfiguration();

  return new Analytics({
    writeKey: configuration.segmentSourceWriteKey,
  });
};

export async function sendCustomer(customer: Customer) {
  const logger = getLogger();

  const analytics = createAnalytics();

  try {
    analytics.identify({
      userId: customer.id,
      traits: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        title: customer.title,
        salutation: customer.salutation,
        dateOfBirth: customer.dateOfBirth,
        customerNumber: customer.customerNumber,
        externalId: customer.externalId,
        isEmailVerified: customer.isEmailVerified,
        locale: customer.locale,
      },
    });

    logger.info(`Customer ${customer.id} sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending customer to Segment: ${error}`);
    throw error;
  }
}

export async function sendOrderPlacedTrackEvent(order: Order) {
  const logger = getLogger();

  const analytics = createAnalytics();

  try {
    logger.info(
      `Order has customer ID: ${order.customerId} and anonymous ID: ${order.anonymousId}`
    );

    const event: TrackParams = {
      userId: order.customerId as string, // need either userId or anonymousId
      anonymousId: order.anonymousId,
      timestamp: new Date(order.createdAt).toISOString(),
      event: 'Order Placed',
      properties: {
        email: order.customerEmail,
        order_id: order.id,
        total_cent_amount: order.totalPrice?.centAmount,
        currency: order.totalPrice?.currencyCode,
      },
    };

    analytics.track(event);

    logger.info(`Order ${order.id} track event sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending order to Segment: ${error}`);
    throw error;
  }
}
