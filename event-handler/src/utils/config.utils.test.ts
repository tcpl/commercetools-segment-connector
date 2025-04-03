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

    setMinimumValidEnvVars(testConfig);
    process.env.LOCALE = 'en-US';
    process.env.CONSENT_CUSTOM_FIELD_NAME = 'consentCustomFieldName';

    const config = readConfiguration();

    expect(config).toEqual({
      clientId: testConfig.clientId,
      clientSecret: testConfig.clientSecret,
      projectKey: testConfig.projectKey,
      authUrl: testConfig.authUrl,
      apiUrl: testConfig.apiUrl,
      segmentSourceWriteKey: testConfig.segmentSourceWriteKey,
      segmentPublicApiHost: testConfig.segmentPublicApiHost,
      locale: 'en-US',
      consentCustomFieldName: 'consentCustomFieldName',
    });
  });

  it('should throw an error when required environment variables are missing', () => {
    process.env.CTP_CLIENT_ID = '';
    process.env.CTP_CLIENT_SECRET = '';
    process.env.CTP_PROJECT_KEY = '';

    expect(readConfiguration).toThrow(EnvironmentVariablesValidationError);
  });

  it('should use default locale when LOCALE is not set', () => {
    const testConfig = getConfig();

    setMinimumValidEnvVars(testConfig);
    delete process.env.LOCALE;

    const config = readConfiguration();

    expect(config.locale).toBe('en-GB');
  });

  it('should use default consent custom field name when not set', () => {
    const testConfig = getConfig();

    setMinimumValidEnvVars(testConfig);
    delete process.env.CONSENT_CUSTOM_FIELD_NAME;

    const config = readConfiguration();

    expect(config.consentCustomFieldName).toBe('consent');
  });
});

const setMinimumValidEnvVars = (testConfig: ReturnType<typeof getConfig>) => {
  process.env.CTP_CLIENT_ID = testConfig.clientId;
  process.env.CTP_CLIENT_SECRET = testConfig.clientSecret;
  process.env.CTP_PROJECT_KEY = testConfig.projectKey;
  process.env.CTP_AUTH_URL = testConfig.authUrl;
  process.env.CTP_API_URL = testConfig.apiUrl;
  process.env.SEGMENT_SOURCE_WRITE_KEY = testConfig.segmentSourceWriteKey;
};
