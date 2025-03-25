import { createApiRoot } from '../client/create.client';

export async function getCustomer(customerId: string) {
  const response = await createApiRoot()
    .customers()
    .withId({
      ID: customerId,
    })
    .get()
    .execute();

  return response.body;
}
