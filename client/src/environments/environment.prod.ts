import { EnvironmentDescription } from "./environment.description";
import * as VERSION from "./version";

export const environment: EnvironmentDescription = {
  production: true,
  canonicalHost: "blattwerkzeug.de",
  apiEndpoint: "https://blattwerkzeug.de/api",
  loginEnabled: false,
  piwik: {
    host: "https://piwik.blattwerkzeug.de",
    id: 1,
  },
  sentry: {
    dsn: "https://c5c678d48ca2423199899208a6f3f70b@sentry.blattwerkzeug.de/3",
    active: true,
    showDialogue: true,
  },
  version: {
    hash: VERSION.GIT_REVISION,
    date: VERSION.BUILD_DATE,
  },
  availableLanguages: [
    { token: "de", name: "Deutsch" },
    { token: "en", name: "English" },
  ],
};
