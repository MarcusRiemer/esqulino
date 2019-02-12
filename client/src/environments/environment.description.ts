export interface EnvironmentDescription {
  production: boolean;
  piwik: {
    host: string;
    id: number;
  };
  sentry?: {
    dsn?: string;
    active?: boolean;
  };
  version: {
    hash: string;
    date: string;
  };
}