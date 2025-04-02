import { getOrder } from './order-service';
import { getCustomerByEmail } from './customer-service';
import {
  identifyAnonymousCustomer,
  trackOrderCompleted,
} from './segment-analytics-service';
import { getLogger } from '../utils/logger.utils';

export async function handleOrderCreated(orderId: string) {
  const logger = getLogger();

  const order = await getOrder(orderId);

  if (!order.customerId && !order.anonymousId) {
    logger.warn(`Order ${orderId} has no customerId or anonymousId`);
    return;
  }

  // Handle anonymous orders
  if (!order.customerId && order.customerEmail && order.anonymousId) {
    const customer = await getCustomerByEmail(order.customerEmail);

    // only identify the user if they are not already in the system
    if (!customer) {
      let consent;

      if (order.custom?.fields.consent) {
        consent = JSON.parse(order.custom.fields.consent);
      }

      identifyAnonymousCustomer(
        order.anonymousId,
        order.customerEmail,
        consent
      );
    }
  }

  trackOrderCompleted(order);
}
