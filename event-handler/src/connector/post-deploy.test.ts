import { it, expect, beforeEach, describe, jest } from '@jest/globals';
import { run } from './post-deploy';
import { createApiRoot } from '../client/create.client';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

jest.mock('../client/create.client');

const mockPost = jest.fn();

const emptyGetSubscriptionsResponse = {
  body: {
    results: [],
  },
};

beforeEach(() => {
  jest.clearAllMocks();

  (createApiRoot as jest.Mock).mockReturnValue(
    getMockApiRoot(emptyGetSubscriptionsResponse)
  );
});

describe('post-deploy', () => {
  it('should create a new subscription if none exists', async () => {
    process.env.CONNECT_GCP_TOPIC_NAME = 'test-topic';
    process.env.CONNECT_GCP_PROJECT_ID = 'test-project';

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

  // it('should update an existing subscription if one exists', async () => {
  //   const mockApiRoot = getMockApiRoot(subscriptionExistsResponse);

  //   await createSubscription(mockApiRoot, topicName, projectId);

  //   expect(mockPost).toHaveBeenCalledWith({
  //     body: {
  //       version: 1,
  //       actions: [
  //         {
  //           action: 'changeDestination',
  //           destination,
  //         },
  //       ],
  //     },
  //   });
  // });

  // it('should create a subscription with the correct parameters', async () => {
  //   process.env.CONNECT_GCP_TOPIC_NAME = 'test-topic';
  //   process.env.CONNECT_GCP_PROJECT_ID = 'test-project';

  //   await run();

  //   expect(mockCreateSubscription).toHaveBeenCalledWith(
  //     expect.anything(),
  //     'test-topic',
  //     'test-project'
  //   );
  // });

  // it('should log an error and set exit code on failure', async () => {
  //   const mockLogger = require('../utils/logger.utils').getLogger();
  //   mockCreateSubscription.mockRejectedValue(new Error('Test error'));

  //   await run();

  //   expect(mockLogger.error).toHaveBeenCalledWith(
  //     'Post-deploy failed:',
  //     expect.any(Error)
  //   );
  //   expect(process.exitCode).toBe(1);
  // });
});

const getMockApiRoot = (
  mockGetResponse: object
): ByProjectKeyRequestBuilder => {
  return {
    subscriptions: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    post: mockPost.mockReturnThis(),
    // @ts-expect-error
    execute: jest.fn().mockResolvedValue(mockGetResponse),
  } as unknown as ByProjectKeyRequestBuilder;
};

// const getMockApiRoot = (mockGetResponse: object) => {
//   return {
//     subscriptions: jest.fn().mockReturnThis(),
//     get: jest.fn().mockReturnThis(),
//     withId: jest.fn().mockReturnThis(),
//     withKey: jest.fn().mockReturnThis(),
//     delete: mockDelete,
//     post: mockPost,
//     execute: jest.fn().mockResolvedValue(mockGetResponse),
//   } as unknown as ByProjectKeyRequestBuilder;
// };
