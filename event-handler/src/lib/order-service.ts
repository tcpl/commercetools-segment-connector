import { createApiRoot } from '../client/create.client';

export async function getOrder(orderId: string) {
  const response = await createApiRoot()
    .orders()
    .withId({
      ID: orderId,
    })
    .get({
      queryArgs: {
        expand: ['discountCodes[*].discountCode'],
      },
    })
    .execute();

  return response.body;
}
