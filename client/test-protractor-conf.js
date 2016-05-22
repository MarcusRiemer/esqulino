exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  useAllAngular2AppRoots: true,
  baseUrl: 'http://localhost:9292',
  suites: {
    front : ['app/front/*.e2e.ts'],
    projectSettings : ['app/editor/settings.e2e.ts'],
    projectSchema : ['app/editor/schema.e2e.ts']
  },
  multiCapabilities: [{
    'browserName': 'firefox'
  },/*{
    'browserName': 'chrome'
  }*/]
}
