import { Configuration } from '../types/index.types';

export const getConfig = (): Configuration => {
  return {
    clientId: '012345678901234567890123', // 24 characters
    clientSecret: '01234567890123456789012345678901', // 32 characters
    projectKey: 'test-project-key',
    authUrl: 'https://auth.example.com',
    apiUrl: 'https://api.example.com',
    segmentSourceWriteKey: 'mock-segment-write-key',
    segmentAnalyticsHost: 'https://api.segment.io',
    segmentPublicApiToken: 'mock-segment-public-api-token',
    segmentPublicApiHost: 'https://api.segmentapis.com',
    locale: 'en-GB',
    consentCustomFieldName: 'consent',
  };
};
