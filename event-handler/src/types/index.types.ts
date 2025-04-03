export interface Configuration {
  clientId: string;
  clientSecret: string;
  projectKey: string;
  authUrl: string;
  apiUrl: string;
  segmentSourceWriteKey: string;
  segmentPublicApiToken?: string;
  segmentPublicApiHost: string;
  locale: string;
  consentCustomFieldName: string;
  otlpExporterEndpoint?: string;
  otlpExporterEndpointApiKey?: string;
}
