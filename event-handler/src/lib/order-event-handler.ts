import { getOrder } from './order-service';
import { sendOrderPlacedTrackEvent } from './segment-service';

export async function handleOrderCreated(orderId: string) {
  const order = await getOrder(orderId);

  await sendOrderPlacedTrackEvent(order);
}
