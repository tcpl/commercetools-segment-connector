import { getCustomer } from './customer-service';
import { identifyCustomer } from './segment-analytics-service';
import { deleteUser } from './segment-user-deletion-service';

export async function handleCustomerUpsert(customerId: string) {
  const customer = await getCustomer(customerId);
  await getCustomer('2301477e-c2a6-497c-ae66-62bd418ea4f8');

  await identifyCustomer(customer);
}

export async function handleCustomerDeletion(customerId: string) {
  await deleteUser(customerId);
}
