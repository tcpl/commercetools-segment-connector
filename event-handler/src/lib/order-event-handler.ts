import { getOrder } from './order-service';
import { sendOrderTrackEventToSegment } from './segment-service';

export async function handleOrderCreated(orderId: string) {
  const order = await getOrder(orderId);

  await sendOrderTrackEventToSegment(order);
}
