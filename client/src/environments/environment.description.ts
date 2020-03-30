export interface EnvironmentDescription {
  production: boolean;
  // Host-part of the URL where the project is available
  canonicalHost: string;
  // API endpoint for server-side API requests. The browser will
  // ignore this and use a relative URL instead.
  apiEndpoint: string;
  // Find out which part of the app are actually used
  // with Matomo
  piwik: {
    host: string;
    id: number;
  };
  loginEnabled: boolean;
  // Tracking bugs in the live environment with Sentry
  sentry: {
    dsn: string;
  } & (
    | {
        active: true;
        showDialogue: boolean;
      }
    | {
        active: false;
      }
  );
  // Build information
  version: {
    hash: string;
    date: string;
  };

  availableLanguages: {
    token: string;
    name: string;
  }[];
}
