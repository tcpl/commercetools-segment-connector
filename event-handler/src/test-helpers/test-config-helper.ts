import { Configuration } from '../types/index.types';

export const getConfig = (): Configuration => {
  return {
    clientId: 'mock-client-id',
    clientSecret: 'mock-client-secret',
    projectKey: 'mock-project-key',
    authUrl: 'https://mock-auth-url.com',
    apiUrl: 'https://mock-api-url.com',
    segmentSourceWriteKey: 'mock-segment-write-key',
    locale: 'en-GB',
  };
};
