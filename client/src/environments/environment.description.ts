export interface EnvironmentDescription {
  production: boolean;
  // URL-prefix for all API requests
  apiEndpoint: string;
  // Find out which part of the app are actually used
  // with Matomo
  piwik: {
    host: string;
    id: number;
  };
  // Tracking bugs in the live environment with Sentry
  sentry: {
    dsn: string;
  } & ({
    active: true;
    showDialogue: boolean;
  } | {
    active: false;
  });
  // Build information
  version: {
    hash: string;
    date: string;
  };
}