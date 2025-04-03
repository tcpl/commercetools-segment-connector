export interface Configuration {
  clientId: string;
  clientSecret: string;
  projectKey: string;
  authUrl: string;
  apiUrl: string;
  segmentAnalyticsHost: string;
  segmentSourceWriteKey: string;
  segmentPublicApiHost: string;
  segmentPublicApiToken?: string;
  locale: string;
  consentCustomFieldName: string;
  otlpExporterEndpoint?: string;
  otlpExporterEndpointApiKey?: string;
}
