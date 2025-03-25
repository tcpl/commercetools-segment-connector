import { getLogger } from '../utils/logger.utils';
import { getCustomer } from './customer-service';
import { sendCustomerToSegment } from './segment-service';

export async function handleCustomerCreated(customerId: string) {
  const logger = getLogger();

  logger.info(`Customer Created: ${customerId}`);

  const customer = await getCustomer(customerId);

  await sendCustomerToSegment(customer);
}
