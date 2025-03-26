import { getCustomer } from './customer-service';
import { sendCustomer } from './segment-service';

export async function handleCustomerUpsert(customerId: string) {
  const customer = await getCustomer(customerId);

  sendCustomer(customer);
}
