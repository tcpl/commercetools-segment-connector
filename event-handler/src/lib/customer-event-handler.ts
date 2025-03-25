import { getCustomer } from './customer-service';
import { sendCustomerToSegment } from './segment-service';

export async function handleCustomerUpsert(customerId: string) {
  const customer = await getCustomer(customerId);

  await sendCustomerToSegment(customer);
}
