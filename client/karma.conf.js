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
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client:{
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: path.join(__dirname, 'coverage'),
      reports: [ 'html', 'lcovonly', 'cobertura' ],
      fixWebpackSourcePaths: true,
    },
    junitReporter: {
      outputDir: 'test-results'
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: ['junit', 'progress', 'kjhtml'],
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
      }
    },
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    singleRun: true
  });
};
