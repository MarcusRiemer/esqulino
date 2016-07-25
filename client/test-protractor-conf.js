/*pageObjects = [
  '../dist/client/node_modules/systemjs/dist/system.src.js',
  '../dist/client/systemjs.config.js',
  '../dist/client/app/editor/query/create.e2e.page.js'
];*/

exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  useAllAngular2AppRoots: true,
  baseUrl: 'http://localhost:9292',

  specs : [

  ],
  
  suites: {
    front : ['../dist/client/app/front/*.e2e.js'],
    editorGeneral : ['../dist/client/app/editor/editor.e2e.js'],
    projectSettings : ['../dist/client/app/editor/settings.e2e.js'],
    projectSchema : ['../dist/client/app/editor/schema.e2e.js'],
    queryCreate : ['../dist/client/app/editor/query/create.e2e.js'],
    pageCreate : ['../dist/client/app/editor/page/create.e2e.js']
  },
  multiCapabilities: [{
    'browserName': 'firefox'
  },/*{
    'browserName': 'chrome'
  }*/]
}
