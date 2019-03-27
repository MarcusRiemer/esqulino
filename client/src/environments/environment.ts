// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

import { EnvironmentDescription } from './environment.description'
import * as VERSION from './version'

export const environment: EnvironmentDescription = {
  production: false,
  piwik: {
    host: "https://piwik.blattwerkzeug.de",
    id: 2
  },
  sentry: {
    dsn: "https://c5c678d48ca2423199899208a6f3f70b@sentry.blattwerkzeug.de/3",
    active: true,
    showDialogue: false
  },
  version: {
    hash: VERSION.GIT_REVISION,
    date: VERSION.BUILD_DATE
  }
};
