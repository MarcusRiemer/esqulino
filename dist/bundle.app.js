var SystemBuilder = require('systemjs-builder');
var builder = new SystemBuilder();

builder.loadConfig('./systemjs.config.js')
  .then(function(){
	  return builder.bundle(
          'app - lib-bundle.js', // build the app only, exclude everything already included in dependencies
          'app-bundle.js');
  })
  .then(function(){
	  console.log('Application bundles built successfully!');
  });
