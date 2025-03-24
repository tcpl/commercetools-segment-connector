export interface Configuration {
  clientId: string;
  clientSecret: string;
  projectKey: string;
  authUrl: string;
  apiUrl: string;
  segmentSourceWriteKey: string;
  // basicAuthPwdCurrent: string;
  // basicAuthPwdPrevious?: string;
  otlpExporterEndpoint?: string;
  otlpExporterEndpointApiKey?: string;
}
