import { createClient } from './build.client';
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { readConfiguration } from '../utils/config.utils';
import { ByProjectKeyRequestBuilder } from '@commercetools/platform-sdk/dist/declarations/src/generated/client/by-project-key-request-builder';
import { Configuration } from '../types/index.types';

const getProjectScope = (configuration: Configuration, scope: string) =>
  `${scope}:${configuration.projectKey}`;

// used for install/uninstall - has manage_subscriptions scope
export const createAdminApiRoot = () => {
  const configuration = readConfiguration();

  const scopes = [
    getProjectScope(configuration, 'manage_subscriptions'),
    getProjectScope(configuration, 'view_orders'),
    getProjectScope(configuration, 'view_customers'),
  ];

  return createApiBuilderFromCtpClient(
    createClient(configuration, scopes)
  ).withProjectKey({
    projectKey: configuration.projectKey,
  });
};

export const createApiRoot = ((root?: ByProjectKeyRequestBuilder) => () => {
  if (root) {
    return root;
  }

  const configuration = readConfiguration();

  const scopes = [
    getProjectScope(configuration, 'view_orders'),
    getProjectScope(configuration, 'view_customers'),
  ];

  root = createApiBuilderFromCtpClient(
    createClient(configuration, scopes)
  ).withProjectKey({
    projectKey: configuration.projectKey,
  });

  return root;
})();
