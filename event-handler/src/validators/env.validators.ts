import {
  standardString,
  standardKey,
  standardUrl,
  optional,
} from './helpers.validators';

const envValidators = [
  standardString(
    ['clientId'],
    {
      code: 'InvalidClientId',
      message: 'Client id should be 24 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 24, max: 24 }
  ),

  standardString(
    ['clientSecret'],
    {
      code: 'InvalidClientSecret',
      message: 'Client secret should be 32 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 32, max: 32 }
  ),

  standardKey(['projectKey'], {
    code: 'InvalidProjectKey',
    message: 'Project key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  standardUrl(['authUrl'], {
    code: 'InvalidAuthUrl',
    message: 'CTP_AUTH_URL is not a valid URL.',
    referencedBy: 'environmentVariables',
  }),

  standardUrl(['apiUrl'], {
    code: 'InvalidApiUrl',
    message: 'CTP_API_URL is not a valid URL.',
    referencedBy: 'environmentVariables',
  }),

  optional(standardUrl)(['otlpExporterEndpoint'], {
    code: 'InvalidOtlpExporterEndpoint',
    message: 'Otlp Exporter Host is not a valid URL.',
    referencedBy: 'environmentVariables',
  }),

  optional(standardString)(
    ['otlpExporterEndpointApiKey'],
    {
      code: 'InvalidOtlpExporterHostApiKey',
      message: 'Otlp key not correct.',
      referencedBy: 'environmentVariables',
    },
    { min: 4, max: 128 }
  ),

  standardString(
    ['segmentSourceWriteKey'],
    {
      code: 'InvalidSegmentSourceWriteKey',
      message: 'Segment Source Write Key should be set.',
      referencedBy: 'environmentVariables',
    },
    { min: 1, max: 128 }
  ),
];

export default envValidators;
