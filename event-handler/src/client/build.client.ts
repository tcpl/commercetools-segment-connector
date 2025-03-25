import { ClientBuilder } from '@commercetools/sdk-client-v2';
import type {
  AuthMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { readConfiguration } from '../utils/config.utils';

const configuration = readConfiguration();

const projectScope = (scope: string) => `${scope}:${configuration.projectKey}`;

export const createClient = () =>
  new ClientBuilder()
    .withProjectKey(configuration.projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();

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
    projectScope('manage_subscriptions'), // TODO: only want this when installing/uninstalling the connector
    projectScope('view_orders'),
    projectScope('view_customers'),
  ],
};
