// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-html-reporter'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('karma-browserstack-launcher'),
      require('karma-summary-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client:{
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        timeoutInterval: 500
      },
      captureConsole: false,
    },
    coverageIstanbulReporter: {
      dir: path.join(__dirname, 'coverage'),
      reports: [ 'html', 'lcovonly', 'cobertura' ],
      fixWebpackSourcePaths: true,
    },
    junitReporter: {
      outputDir: 'test-results'
    },
    htmlReporter: {
      namedFiles: true, // File per browser instead of folder per browser
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['progress', 'summary', 'junit', 'kjhtml', 'html', 'BrowserStack'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--headless',
          '--disable-gpu',
          // Without a remote debugging port, Google Chrome exits immediately.
          '--remote-debugging-port=9222',
          '--no-sandbox'
        ],
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [
          '--headless'
        ]
      },
      BrowserStackEdge15: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '15',
        os: 'Windows',
        os_version: '10'
      },
      BrowserStackEdge18: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '18',
        os: 'Windows',
        os_version: '10'
      },
      BrowserStackEdgeLatest: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '10'
      },
      BrowserStackiPhoneLatest: {
        base: 'BrowserStack',
        browser: 'iPhone',
        device: 'iPhone XS',
        os: 'ios',
        os_version: '13'
      },
      BrowserStackSafariLatest: {
        base: 'BrowserStack',
        browser: 'Safari',
        browser_version : 'latest',
        os: 'OS X',
        os_version: 'Catalina'
      }
    },
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    browserNoActivityTimeout: 60000, // Wait for a minute, 30 Seconds may be to short for Browserstack
    singleRun: true
  });
};
