import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import { join } from 'path';

/**
 * Some library we load doesn't understand its in a node-environment
 * and attempts to register callbacks. What a dumb idea ...
 */
if (!global.window) {
  global.window = {
    addEventListener: function() { }
  };
}

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

const FALLBACK_LANG = 'de';

// import language bundles
const deBundle = require('./dist/server/de/main');
const enBundle = require('./dist/server/en/main');

const angularApps = {
  de: ngExpressEngine({
    bootstrap: deBundle.AppServerModuleNgFactory,
    providers: [provideModuleMap(deBundle.LAZY_MODULE_MAP)]
  }),
  en: ngExpressEngine({
    bootstrap: enBundle.AppServerModuleNgFactory,
    providers: [provideModuleMap(enBundle.LAZY_MODULE_MAP)]
  })
}

app.engine('html', (filePath, options, callback) => {
  options.engine(
    filePath,
    { req: options.req, res: options.res },
    callback
  )
});

app.set('view engine', 'html');

// Top level directory of compiled Angular applications
app.set('views', join(DIST_FOLDER, 'browser'));

// API targets should never reach the universal sever
app.get('/api/**', (_req, res) => {
  res.status(500);
  res.send('Universal Server has no /api endpoint')
});

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser/de')));
app.get('*.*', express.static(join(DIST_FOLDER, 'browser/en')));

// workaround for server crash caused by favicon.ico
app.get('/favicon.ico', (_req, res) => res.sendStatus(204));

// All paths that remain now are part of Angular
app.get('*', (req, res) => {
  // Trust the user to provide some meaningful language
  let locale = req.subdomains[0] || "de";

  // Check whether such a language actually exists
  let app = angularApps[locale];
  if (!app) {
    // Fall back if the user has supplied something invalid
    app = angularApps[FALLBACK_LANG];
    locale = FALLBACK_LANG;
  }

  // And render the given language
  res.render(`${locale}/index`, {
    req,
    res,
    engine: angularApps[locale]
  });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
