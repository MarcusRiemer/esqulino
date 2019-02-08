import * as VERSION from './version'

export const environment = {
  production: true,
  piwik: {
    host: "https://piwik.blattwerkzeug.de",
    id: 1
  },
  sentry: {
    dsn: "http://c5c678d48ca2423199899208a6f3f70b@sentry.blattwerkzeug.de/3"
  },
  version: {
    hash: VERSION.GIT_REVISION,
    date: VERSION.BUILD_DATE
  }
};
