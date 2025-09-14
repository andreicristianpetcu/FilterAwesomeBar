const gulp = require('gulp')
const gulpif = require('gulp-if')
const log = require('fancy-log')
const colors = require('ansi-colors')
const named = require('vinyl-named')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const gulpWebpack = require('webpack-stream')
const plumber = require('gulp-plumber')
const livereload = require('gulp-livereload')
const args = require('./lib/args')

const ENV = args.production ? 'production' : 'development'

gulp.task('scripts', (cb) => {
  return gulp.src('app/scripts/*.js')
    .pipe(plumber({
      // Webpack will log the errors
      errorHandler () {}
    }))
    .pipe(named())
    .pipe(gulpWebpack({
      devtool: args.sourcemaps ? 'inline-source-map' : false,
      watch: args.watch,
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(ENV),
          'process.env.VENDOR': JSON.stringify(args.vendor)
        })
      ].concat(args.production ? [
        new UglifyJsPlugin()
      ] : []),
      module: {
        rules: [{
          test: /\.js$/,
          loader: 'babel-loader'
        }]
      }
    },
    webpack,
    (err, stats) => {
      if (err) return
      log(`Finished '${colors.cyan('scripts')}'`, stats.toString({
        chunks: false,
        colors: true,
        cached: false,
        children: false
      }))
    }))
    .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
    .pipe(gulpif(args.watch, livereload()))
})
