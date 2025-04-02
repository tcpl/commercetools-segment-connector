import { it, expect, beforeEach, describe } from '@jest/globals';
import { createSubscription, deleteSubscription } from './actions';
import type {
  ByProjectKeyRequestBuilder,
  Destination,
} from '@commercetools/platform-sdk';

jest.mock('../utils/config.utils');

let mockDelete: typeof jest.fn;
let mockPost: typeof jest.fn;

const emptyGetSubscriptionsResponse = {
  body: {
    results: [],
  },
};

const subscriptionExistsResponse = {
  body: {
    results: [
      {
        id: 'subscription-id',
        version: 1,
      },
    ],
  },
};

const topicName = 'test-topic';
const projectId = 'test-project';
const destination: Destination = {
  type: 'GoogleCloudPubSub',
  topic: topicName,
  projectId,
};

beforeEach(() => {
  mockDelete = jest.fn().mockReturnThis();
  mockPost = jest.fn().mockReturnThis();
});

describe('createSubscription', () => {
  it('should create a new subscription if none exists', async () => {
    const mockApiRoot = getMockApiRoot(emptyGetSubscriptionsResponse);

    await createSubscription(mockApiRoot, topicName, projectId);

    expect(mockPost).toHaveBeenCalledWith({
      body: {
        key: 'tcpl-segment-subscription',
        destination,
        changes: [{ resourceTypeId: 'customer' }, { resourceTypeId: 'order' }],
      },
    });
  });

  it('should update an existing subscription if one exists', async () => {
    const mockApiRoot = getMockApiRoot(subscriptionExistsResponse);

    await createSubscription(mockApiRoot, topicName, projectId);

    expect(mockPost).toHaveBeenCalledWith({
      body: {
        version: 1,
        actions: [
          {
            action: 'changeDestination',
            destination,
          },
        ],
      },
    });
  });
});

describe('deleteSubscription', () => {
  it('should delete an existing subscription if one exists', async () => {
    const mockApiRoot = getMockApiRoot(subscriptionExistsResponse);

    await deleteSubscription(mockApiRoot);

    expect(mockDelete).toHaveBeenCalledWith({
      queryArgs: {
        version: 1,
      },
    });
  });

  it('should not attempt to delete if no subscription exists', async () => {
    const mockApiRoot = getMockApiRoot(emptyGetSubscriptionsResponse);

    await deleteSubscription(mockApiRoot);

    expect(mockDelete).not.toHaveBeenCalled();
  });
});

const getMockApiRoot = (mockGetResponse: object) => {
  return {
    subscriptions: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    withId: jest.fn().mockReturnThis(),
    withKey: jest.fn().mockReturnThis(),
    delete: mockDelete,
    post: mockPost,
    execute: jest.fn().mockResolvedValue(mockGetResponse),
  } as unknown as ByProjectKeyRequestBuilder;
};
