const gulp = require('gulp')
const del = require('del')
const args = require('./lib/args')
const karma = require('karma');
var Server = karma.Server;

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + './../karma.conf.js',
    singleRun: true
  }, done).start();
})

gulp.task('test:watch', function (done) {
  new Server({
    configFile: __dirname + './../karma.conf.js',
    singleRun: false
  }, done).start();
})

gulp.task('test:browsers', function (done) {
  new Server({
    configFile: __dirname + './../karma.conf.js',
    browsers: ['Firefox', 'PhantomJS', 'Chrome'],
    singleRun: false
  }, done).start();
})