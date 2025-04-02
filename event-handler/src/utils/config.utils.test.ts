import { readConfiguration } from './config.utils';
import EnvironmentVariablesValidationError from '../errors/environment-variables-validation.error';

describe('readConfiguration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the configuration when all environment variables are valid', () => {
    process.env.CTP_CLIENT_ID = '012345678901234567890123'; // 24 characters
    process.env.CTP_CLIENT_SECRET = '01234567890123456789012345678901'; // 32 characters
    process.env.CTP_PROJECT_KEY = 'test-project-key';
    process.env.CTP_AUTH_URL = 'https://auth.example.com';
    process.env.CTP_API_URL = 'https://api.example.com';
    process.env.SEGMENT_SOURCE_WRITE_KEY = 'segmentWriteKey';
    process.env.LOCALE = 'en-US';

    const config = readConfiguration();

    expect(config).toEqual({
      clientId: '012345678901234567890123',
      clientSecret: '01234567890123456789012345678901',
      projectKey: 'test-project-key',
      authUrl: 'https://auth.example.com',
      apiUrl: 'https://api.example.com',
      segmentSourceWriteKey: 'segmentWriteKey',
      locale: 'en-US',
    });
  });

  it('should throw an error when required environment variables are missing', () => {
    process.env.CTP_CLIENT_ID = '';
    process.env.CTP_CLIENT_SECRET = '';
    process.env.CTP_PROJECT_KEY = '';

    expect(readConfiguration).toThrow(EnvironmentVariablesValidationError);
  });

  // it('should use default locale when LOCALE is not set', () => {
  //   process.env.CTP_CLIENT_ID = 'test-client-id';
  //   process.env.CTP_CLIENT_SECRET = 'test-client-secret';
  //   process.env.CTP_PROJECT_KEY = 'test-project-key';
  //   process.env.CTP_AUTH_URL = 'https://auth.url';
  //   process.env.CTP_API_URL = 'https://api.url';
  //   process.env.SEGMENT_SOURCE_WRITE_KEY = 'test-segment-key';
  //   process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'https://otel.endpoint';
  //   process.env.OTEL_EXPORTER_OTLP_ENDPOINT_API_KEY = 'test-api-key';
  //   delete process.env.LOCALE;

  //   const config = readConfiguration();

  //   expect(config.locale).toBe('en-GB');
  // });
});
