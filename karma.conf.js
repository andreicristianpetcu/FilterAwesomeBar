module.exports = function(config) {
    config.set({
      files: [
        'app/scripts/**/*.js',
        'test/**/*.js'
      ],
      browsers: ['PhantomJS'],
      // coverage reporter generates the coverage 
      reporters: ['progress', 'coverage'],
      frameworks: ['jasmine', 'sinon'],
      preprocessors: {
        // source files, that you wanna generate coverage for 
        // do not include tests or libraries 
        // (these files will be instrumented by Istanbul) 
        'app/scripts/**/*.js': ['coverage']
      },
   
      // optionally, configure the reporter 
      coverageReporter: {
        type : 'html',
        dir : 'coverage/'
      }
    });
  };