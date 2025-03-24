import { ByProjectKeyRequestBuilder } from "@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder";

const SUBSCRIPTION_KEY = "tcpl-segment-subscription";

export async function createSubscription(
  apiRoot: ByProjectKeyRequestBuilder,
  topicName: string,
  projectId: string
) {
  const {
    body: { results: subscriptions },
  } = await getSubscription(apiRoot);

  if (subscriptions.length > 0) {
    return;
  }

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: SUBSCRIPTION_KEY,
        destination: {
          type: "GoogleCloudPubSub",
          topic: topicName,
          projectId,
        },
        changes: [
          {
            resourceTypeId: "customer",
          },
          {
            resourceTypeId: "order",
          },
          {
            resourceTypeId: "cart",
          },
        ],
      },
    })
    .execute();
}

export async function deleteSubscription(apiRoot: ByProjectKeyRequestBuilder) {
  const {
    body: { results: subscriptions },
  } = await getSubscription(apiRoot);

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

const getSubscription = async (apiRoot: ByProjectKeyRequestBuilder) => {
  return await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();
};
