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
    editorProjectSettings : ['../dist/client/app/editor/settings.e2e.js'],
    editorProjectSchema : ['../dist/client/app/editor/schema.e2e.js'],
    editorQueryCreate : ['../dist/client/app/editor/query/create.e2e.js'],
    editorPageCreate : ['../dist/client/app/editor/page/create.e2e.js'],
    multiRouting : ['../dist/client/app/e2e/about-editor-flow.js'],
  },
  multiCapabilities: [{
    'browserName': 'chrome'
  },/*{
    'browserName': 'chrome'
  }*/]
}
