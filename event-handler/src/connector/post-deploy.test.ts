import { it, expect, beforeEach, jest } from '@jest/globals';
import { run } from './post-deploy';
import { createAdminApiRoot } from '../client/create.client';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

jest.mock('../client/create.client');

let mockPost: jest.Mock;

const emptyGetSubscriptionsResponse = {
  body: {
    results: [],
  },
};

const subscriptionExistsResponse = {
  body: {
    results: [
      {
        id: '8bf5c886-73b8-49ea-94df-0156fd1abd6c',
        version: 1,
      },
    ],
  },
};

const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();

  process.env = {
    ...originalEnv,
    CONNECT_GCP_TOPIC_NAME: 'test-topic',
    CONNECT_GCP_PROJECT_ID: 'test-project',
  };

  mockPost = jest.fn().mockReturnThis();
});

afterEach(() => {
  process.env = originalEnv;
});

it('should create a new subscription if none exists', async () => {
  (createAdminApiRoot as jest.Mock).mockReturnValue(
    getMockApiRoot(emptyGetSubscriptionsResponse)
  );

  await run();

  expect(mockPost).toHaveBeenCalledWith({
    body: {
      key: 'tcpl-segment-subscription',
      destination: {
        type: 'GoogleCloudPubSub',
        topic: 'test-topic',
        projectId: 'test-project',
      },
      changes: [{ resourceTypeId: 'customer' }, { resourceTypeId: 'order' }],
    },
  });
});

it('should update an existing subscription if one exists', async () => {
  (createAdminApiRoot as jest.Mock).mockReturnValue(
    getMockApiRoot(subscriptionExistsResponse)
  );

  await run();

  expect(mockPost).toHaveBeenCalledWith({
    body: {
      version: 1,
      actions: [
        {
          action: 'changeDestination',
          destination: {
            type: 'GoogleCloudPubSub',
            topic: 'test-topic',
            projectId: 'test-project',
          },
        },
      ],
    },
  });
});

const getMockApiRoot = (
  mockGetResponse: object
): ByProjectKeyRequestBuilder => {
  return {
    subscriptions: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    withId: jest.fn().mockReturnThis(),
    withKey: jest.fn().mockReturnThis(),
    post: mockPost,
    execute: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockGetResponse)),
  } as unknown as ByProjectKeyRequestBuilder;
};
