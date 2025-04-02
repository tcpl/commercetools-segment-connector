import { readConfiguration } from './config.utils';
import EnvironmentVariablesValidationError from '../errors/environment-variables-validation.error';
import { getConfig } from '../test-helpers/test-config-helper';

describe('readConfiguration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the configuration when all environment variables are valid', () => {
    const testConfig = getConfig();

    process.env.CTP_CLIENT_ID = testConfig.clientId;
    process.env.CTP_CLIENT_SECRET = testConfig.clientSecret;
    process.env.CTP_PROJECT_KEY = testConfig.projectKey;
    process.env.CTP_AUTH_URL = testConfig.authUrl;
    process.env.CTP_API_URL = testConfig.apiUrl;
    process.env.SEGMENT_SOURCE_WRITE_KEY = testConfig.segmentSourceWriteKey;
    process.env.LOCALE = 'en-US';

    const config = readConfiguration();

    expect(config).toEqual({
      clientId: testConfig.clientId,
      clientSecret: testConfig.clientSecret,
      projectKey: testConfig.projectKey,
      authUrl: testConfig.authUrl,
      apiUrl: testConfig.apiUrl,
      segmentSourceWriteKey: testConfig.segmentSourceWriteKey,
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
