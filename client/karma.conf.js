// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

const path = require("path");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require('karma-sabarivka-reporter'),
      require("karma-coverage"),
      require("karma-chrome-launcher"),
      require("karma-firefox-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-junit-reporter"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        timeoutInterval: 500,
      },
    },
    coverageReporter: {
      includeAllSources: true,
      // specify a common output directory
      dir: path.join(__dirname, "coverage"),
      reporters: [
        { type: "html", subdir: "html", },
        { type: "lcovonly", subdir: '.', file: 'lcov.info' },
        { type: "cobertura", subdir: '.', file: 'cobertura-coverage.xml' },
      ],
      // Provided by karma-sabarivka-reporter which collects
      // all untested files for code coverage
      include: [
        // Specify include pattern(s) first
        'src/**/*.(ts|js)',
        // Then specify "do not touch" patterns (note `!` sign on the beginning of each statement)
        '!src/main.(ts|js)',
        '!src/**/*.spec.(ts|js)',
        '!src/**/*.module.(ts|js)',
        '!src/**/environment*.(ts|js)'
      ]
    },
    coverageIstanbulReporter: {
      fixWebpackSourcePaths: true,
    },
    junitReporter: {
      outputDir: "test-results",
    },
    angularCli: {
      environment: "dev",
    },
    // > Important Note: if used with karma-coverage, 'sabarivka' should go
    // > before 'coverage' in reporters list
    // https://github.com/kopach/karma-sabarivka-reporter
    reporters: ["junit", "progress", "kjhtml", "sabarivka", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadless: {
        base: "Chrome",
        flags: [
          "--headless",
          "--disable-gpu",
          // Without a remote debugging port, Google Chrome exits immediately.
          "--remote-debugging-port=9222",
          "--no-sandbox",
        ],
      },
      FirefoxHeadless: {
        base: "Firefox",
        flags: ["--headless"],
      },
    },
    browsers: ["ChromeHeadless", "FirefoxHeadless"],
    singleRun: true,
  });
};
