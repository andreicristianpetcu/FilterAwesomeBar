import gulp from 'gulp'
import del from 'del'
import args from './lib/args'
import karma from 'karma';
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