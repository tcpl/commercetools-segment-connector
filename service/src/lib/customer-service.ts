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

export async function getCustomerByEmail(email: string) {
  const response = await createApiRoot()
    .customers()
    .get({
      queryArgs: {
        where: `lowercaseEmail="${email.toLocaleLowerCase()}"`,
        limit: 1,
      },
    })
    .execute();

  return response.body.results.length > 0 ? response.body.results[0] : null;
}
