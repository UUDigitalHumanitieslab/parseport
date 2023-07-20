// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    let configuration = {
      basePath: '',
      frameworks: ['jasmine', '@angular-devkit/build-angular'],
      plugins: [
        require('karma-jasmine'),
        require('karma-chrome-launcher'),
        require('karma-jasmine-html-reporter'),
        require('karma-coverage'),
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      client: {
        clearContext: false // leave Jasmine Spec Runner output visible in browser
      },
      coverageReporter: {
        dir: require('path').join(__dirname, '../coverage/parseport'),
        reports: [ 'html', 'lcovonly' ],
        fixWebpackSourcePaths: true
      },
      
      reporters: ['progress', 'kjhtml'],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ['ChromeHeadless'],
      singleRun: false,
      customLaunchers: {
          ChromeHeadless: {
            base: 'Chrome',
            flags: [
              '--headless',
              // '--disable-gpu', this might not be needed http://cvuorinen.net/2017/05/running-angular-tests-in-headless-chrome/
              // Without a remote debugging port, Google Chrome exits immediately.
              '--remote-debugging-port=9222',
            ],
          }
        }
    };

    if (process.env.CI) {
        configuration.browsers = ['ChromeHeadless'];
        configuration.singleRun = true;
    }

    config.set(configuration);
  };
  