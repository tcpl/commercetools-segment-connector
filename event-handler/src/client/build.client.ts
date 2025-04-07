import { ClientBuilder } from '@commercetools/sdk-client-v2';
import type {
  AuthMiddlewareOptions,
  HttpMiddlewareOptions,
} from '@commercetools/sdk-client-v2';
import { Configuration } from '../types/index.types';

export const createClient = (
  configuration: Configuration,
  scopes: string[]
) => {
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
    scopes,
  };

  return new ClientBuilder()
    .withProjectKey(configuration.projectKey)
    .withClientCredentialsFlow(authMiddlewareOptions)
    .withHttpMiddleware(httpMiddlewareOptions)
    .build();
};
