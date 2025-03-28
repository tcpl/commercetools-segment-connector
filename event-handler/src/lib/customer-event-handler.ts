import { getCustomer } from './customer-service';
import { identifyCustomer } from './segment-service';

export async function handleCustomerUpsert(customerId: string) {
  const customer = await getCustomer(customerId);

  identifyCustomer(customer);
}
