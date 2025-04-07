export interface Configuration {
  clientId: string;
  clientSecret: string;
  projectKey: string;
  authUrl: string;
  apiUrl: string;
  otlpExporterEndpoint?: string;
  otlpExporterEndpointApiKey?: string;
}
