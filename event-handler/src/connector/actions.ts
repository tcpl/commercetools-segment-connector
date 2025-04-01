import type { Destination } from '@commercetools/platform-sdk';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { getLogger } from '../utils/logger.utils';

const SUBSCRIPTION_KEY = 'tcpl-segment-subscription';

export async function createSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
) {
  const logger = getLogger();

  const {
    body: { results: subscriptions },
  } = await getSubscriptions(apiRoot);

  const destination: Destination = {
    type: 'GoogleCloudPubSub',
    topic: topicName,
    projectId,
  };

  if (subscriptions.length === 0) {
    logger.info('Creating subscription...');
    await apiRoot
      .subscriptions()
      .post({
        body: {
          key: SUBSCRIPTION_KEY,
          destination,
          changes: [
            {
              resourceTypeId: 'customer',
            },
            {
              resourceTypeId: 'order',
            },
          ],
        },
      })
      .execute();
  } else {
    logger.info('Updating subscription...');
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withId({ ID: subscription.id })
      .post({
        body: {
          version: subscription.version,
          actions: [
            {
              action: 'changeDestination',
              destination,
            },
          ],
        },
      })
      .execute();
  }
}

export async function deleteSubscription(apiRoot: ByProjectKeyRequestBuilder) {
  const {
    body: { results: subscriptions },
  } = await getSubscriptions(apiRoot);

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}

const getSubscriptions = async (apiRoot: ByProjectKeyRequestBuilder) => {
  return await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();
};
