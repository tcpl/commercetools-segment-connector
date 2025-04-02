import { getCustomer } from './customer-service';
import { identifyCustomer } from './segment-service';
import { deleteUser } from './segment-user-deletion-service';

export async function handleCustomerUpsert(customerId: string) {
  const customer = await getCustomer(customerId);

  identifyCustomer(customer);
}

export async function handleCustomerDeletion(customerId: string) {
  await deleteUser(customerId);
}
