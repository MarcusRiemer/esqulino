exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  useAllAngular2AppRoots: true,
  baseUrl: 'http://localhost:9292',
  specs: ['app/front/about.spec.ts'],
  multiCapabilities: [{
    'browserName': 'firefox'
  }, {
    'browserName': 'chrome'
  }]
}
