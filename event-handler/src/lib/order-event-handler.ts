import { getLogger } from '../utils/logger.utils';
import { getOrder } from './order-service';
import { sendOrderTrackEventToSegment } from './segment-service';

export async function handleOrderCreated(orderId: string) {
  const logger = getLogger();

  logger.info(`Order created: ${orderId}`);

  const order = await getOrder(orderId);

  await sendOrderTrackEventToSegment(order);
}
