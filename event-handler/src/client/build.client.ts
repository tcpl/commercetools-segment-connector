import { ClientBuilder } from '@commercetools/sdk-client-v2';
import type {
  AuthMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { readConfiguration } from '../utils/config.utils';
import { Configuration } from '../types/index.types';

const getProjectScope = (configuration: Configuration, scope: string) =>
  `${scope}:${configuration.projectKey}`;

export const createClient = () => {
  const configuration = readConfiguration();

  const httpMiddlewareOptions: HttpMiddlewareOptions = {
    host: configuration.apiUrl,
  };

  const authMiddlewareOptions: AuthMiddlewareOptions = {
    host: configuration.authUrl,
    projectKey: configuration.projectKey,
    credentials: {
      clientId: configuration.clientId,
      clientSecret: configuration.clientSecret,
    },
    scopes: [
      getProjectScope(configuration, 'manage_subscriptions'),
      getProjectScope(configuration, 'view_orders'),
      getProjectScope(configuration, 'view_customers'),
    ],
  };

  return new ClientBuilder()
    .withProjectKey(configuration.projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();
};
