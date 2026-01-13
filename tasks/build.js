const gulp = require('gulp')

gulp.task('build', [
  'clean',
  'manifest',
  'scripts',
  'styles',
  'pages',
  'locales',
  'images',
  'fonts',
  'chromereload'
])
