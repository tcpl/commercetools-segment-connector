import { getOrder } from './order-service';
import { getCustomerByEmail } from './customer-service';
import {
  identifyAnonymousUser,
  sendOrderCompletedTrackEvent,
} from './segment-service';

export async function handleOrderCreated(orderId: string) {
  const order = await getOrder(orderId);

  // Handle anonymous orders
  if (!order.customerId && order.customerEmail && order.anonymousId) {
    const customer = await getCustomerByEmail(order.customerEmail);

    // only identify the user if they are not already in the system
    if (!customer) {
      await identifyAnonymousUser(order.anonymousId, order.customerEmail);
    }
  }

  await sendOrderCompletedTrackEvent(order);
}
