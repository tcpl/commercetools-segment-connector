export const readConfiguration = jest.fn(() => ({
  clientId: 'mock-client-id',
  clientSecret: 'mock-client-secret',
  projectKey: 'mock-project-key',
  authUrl: 'https://mock-auth-url.com',
  apiUrl: 'https://mock-api-url.com',
  segmentSourceWriteKey: 'mock-segment-write-key',
}));
