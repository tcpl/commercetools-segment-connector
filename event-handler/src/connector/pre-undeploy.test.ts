import { it, expect, beforeEach, jest } from '@jest/globals';
import { run } from './pre-undeploy';
import { createApiRoot } from '../client/create.client';
import type { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk';

jest.mock('../client/create.client');

let mockDelete: jest.Mock;

const emptyGetSubscriptionsResponse = {
  body: {
    results: [],
  },
};

const subscriptionExistsResponse = {
  body: {
    results: [
      {
        id: '54fdc3c1-6cb7-4030-b71d-3f0902c28658',
        version: 1,
      },
    ],
  },
};

beforeEach(() => {
  jest.clearAllMocks();

  mockDelete = jest.fn().mockReturnThis();
});

it('should delete an existing subscription if one exists', async () => {
  (createApiRoot as jest.Mock).mockReturnValue(
    getMockApiRoot(subscriptionExistsResponse)
  );

  await run();

  expect(mockDelete).toHaveBeenCalledWith({
    queryArgs: {
      version: 1,
    },
  });
});

it('should not attempt to delete if no subscription exists', async () => {
  (createApiRoot as jest.Mock).mockReturnValue(
    getMockApiRoot(emptyGetSubscriptionsResponse)
  );

  await run();

  expect(mockDelete).not.toHaveBeenCalled();
});

const getMockApiRoot = (
  mockGetResponse: object
): ByProjectKeyRequestBuilder => {
  return {
    subscriptions: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    withId: jest.fn().mockReturnThis(),
    withKey: jest.fn().mockReturnThis(),
    delete: mockDelete,
    execute: jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockGetResponse)),
  } as unknown as ByProjectKeyRequestBuilder;
};
