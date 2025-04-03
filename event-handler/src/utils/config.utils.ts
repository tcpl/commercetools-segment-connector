import EnvironmentVariablesValidationError from '../errors/environment-variables-validation.error';
import type { Configuration } from '../types/index.types';
import envValidators from '../validators/env.validators';
import { getValidateMessages } from '../validators/helpers.validators';

export const readConfiguration = (): Configuration => {
  const envVars: Configuration = {
    clientId: process.env.CTP_CLIENT_ID as string,
    clientSecret: process.env.CTP_CLIENT_SECRET as string,
    projectKey: process.env.CTP_PROJECT_KEY as string,
    authUrl: process.env.CTP_AUTH_URL as string,
    apiUrl: process.env.CTP_API_URL as string,
    segmentSourceWriteKey: process.env.SEGMENT_SOURCE_WRITE_KEY as string,
    segmentPublicApiToken: process.env.SEGMENT_PUBLIC_API_TOKEN,
    segmentPublicApiHost:
      process.env.SEGMENT_PUBLIC_API_HOST ?? 'https://api.segmentapis.com',
    otlpExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    otlpExporterEndpointApiKey: process.env
      .OTEL_EXPORTER_OTLP_ENDPOINT_API_KEY as string,
    locale: process.env.LOCALE ?? 'en-GB',
    consentCustomFieldName: process.env.CONSENT_CUSTOM_FIELD_NAME ?? 'consent',
  };

  const validationErrors = getValidateMessages(envValidators, envVars);

  if (validationErrors.length) {
    throw new EnvironmentVariablesValidationError(
      'InvalidEnvironmentVariablesError',
      'Invalid Environment Variables please check your .env file',
      validationErrors
    );
  }

  return envVars;
};
