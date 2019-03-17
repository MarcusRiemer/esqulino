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

// import language bundles
const defaultBundle = require('./dist/server/main');
const enBundle = require('./dist/server/en/main');

const languageEngines = [{
  id: 'en',
  base: '/en',
  engine: ngExpressEngine({
    bootstrap: enBundle.AppServerModuleNgFactory,
    providers: [provideModuleMap(enBundle.LAZY_MODULE_MAP)]
  })
},
{
  id: 'de',
  base: '',
  engine: ngExpressEngine({
    bootstrap: defaultBundle.AppServerModuleNgFactory,
    providers: [provideModuleMap(defaultBundle.LAZY_MODULE_MAP)]
  })
}];

app.engine('html', (filePath, options, callback) => {
  options.engine(
    filePath,
    { req: options.req, res: options.res},
    callback
  )
});

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// Example Express Rest API endpoints
app.get('/api/**', (req, res) => { res.send('OK') });
// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser'), {
  maxAge: '1y'
}));

// workaround for server crash caused by favicon.ico
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// All regular routes use the Universal engine
languageEngines.forEach(languageEngine => {

  const paths = languageEngine.base ? [languageEngine.base, `${languageEngine.base}/*`] : '*'
  const view = languageEngine.base ? `.${languageEngine.base}/index` : 'index'

  app.get(paths, (req, res) => {
    res.render(view, {
      req,
      res,
      engine: languageEngine.engine
    })
  })
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
