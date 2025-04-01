import { it, expect } from '@jest/globals';
import envValidators from '../validators/env.validators';
import { Configuration } from '../types/index.types';
import { getValidateMessages } from './helpers.validators';

it('valid configuration should return no errors', () => {
  const validationErrors = validate();

  expect(validationErrors).toEqual([]);
});

it('invalid clientId should return error', () => {
  const validationErrors = validate({ clientId: 'invalidClientId' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InvalidClientId',
      }),
    ])
  );
});

it('invalid clientSecret should return error', () => {
  const validationErrors = validate({ clientSecret: 'invalidClientSecret' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InvalidClientSecret',
      }),
    ])
  );
});

it('invalid projectKey should return error', () => {
  const validationErrors = validate({ projectKey: '' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InvalidProjectKey',
      }),
    ])
  );
});

it('invalid otlpExporterEndpoint should return error', () => {
  const validationErrors = validate({ otlpExporterEndpoint: 'invalidHost' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InvalidOtlpExporterEndpoint',
      }),
    ])
  );
});

it('invalid otlpExporterEndpointApiKey should return error', () => {
  const validationErrors = validate({ otlpExporterEndpointApiKey: '0' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InValidOtlpExporterHostApiKey',
      }),
    ])
  );
});

it('invalid segmentSourceWriteKey should return error', () => {
  const validationErrors = validate({ segmentSourceWriteKey: '' });

  expect(validationErrors).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        code: 'InvalidSegmentSourceWriteKey',
      }),
    ])
  );
});

const validate = (overrides?: object) => {
  const envVars: Configuration = {
    clientId: '012345678901234567890123', // 24 characters
    clientSecret: '01234567890123456789012345678901', // 32 characters
    projectKey: 'projectKey',
    authUrl: 'https://auth.example.com',
    apiUrl: 'https://api.example.com',
    segmentSourceWriteKey: 'segmentWriteKey',
    locale: 'en-GB',
    ...overrides,
  };

  return getValidateMessages(envValidators, envVars);
};
