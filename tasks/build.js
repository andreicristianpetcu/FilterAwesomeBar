import gulp from 'gulp'

gulp.task('build', gulp.series(
  'clean',
  'manifest',
  'scripts',
  'styles',
  'pages',
  'locales',
  'images',
  'fonts',
  'chromereload'
))
