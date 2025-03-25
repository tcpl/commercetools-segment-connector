import { Analytics, TrackParams } from '@segment/analytics-node';
import { getLogger } from '../utils/logger.utils';
import { Customer, Order } from '@commercetools/platform-sdk';

const createAnalytics = () =>
  new Analytics({
    writeKey: process.env.SEGMENT_WRITE_KEY!,
  });

export async function sendCustomerToSegment(customer: Customer) {
  const logger = getLogger();

  if (!customer || !customer.id) {
    logger.error('Invalid customer data for Segment');
    return;
  }

  const analytics = createAnalytics();

  try {
    analytics.identify({
      userId: customer.id,
      traits: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    });

    logger.info(`Customer ${customer.id} sent to Segment successfully`);
  } catch (error) {
    logger.error(`Error sending customer to Segment: ${error}`);
    throw error;
  }
}

export async function sendOrderTrackEventToSegment(order: Order) {
  const logger = getLogger();

  if (!order || !order.id) {
    logger.error('Invalid order data for Segment');
    return;
  }

  const analytics = createAnalytics();

  try {
    const customerId = order.customerId;
    let anonymousId;

    if (!customerId) {
      anonymousId = order.anonymousId;
    }

    const event: TrackParams = {
      userId: customerId as string,
      anonymousId: anonymousId,
      event: 'Order Completed',
      properties: {
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
