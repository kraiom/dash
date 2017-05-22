'use strict'

const $ = require('gulp-load-plugins')()
const gulp = require('gulp')

gulp.task ('styles', () => gulp
  .src('css/less/*.less')
  .pipe($.less())
  .pipe($.minifyCss())
  .pipe($.concat('css.css'))
  .pipe(gulp.dest('css/'))
)

gulp.task ('dash', () => gulp
  .src('js/dash/*.js')
  .pipe($.order([
    'js/dash/dash-utils.js',
    'js/dash/*.js'
  ]))
  .pipe($.uglify())
  .pipe($.concat('dash.min.js'))
  .pipe(gulp.dest('js/assets/'))
)

gulp.task ('fb', () => gulp
  .src('js/libs/fb.js')
  .pipe($.uglify())
  .pipe($.concat('fb.min.js'))
  .pipe(gulp.dest('js/libs/'))
)

gulp.task ('libs', () => gulp
  .src([
    'js/libs/jquery*',
    'js/libs/keypress*',
    'js/libs/hammer.min.js'
  ])
  .pipe($.uglify())
  .pipe($.concat('libs.min.js'))
  .pipe(gulp.dest('js/assets/'))
)

gulp.task ('scripts', ['dash', 'libs'], () => gulp
  .src('js/assets/*.js')
  .pipe($.uglify())
  .pipe($.order([
    'libs.min.js',
    'dash.min.js',
    'common.js'
  ]), { base: './js/assets' })
  .pipe($.concat('script.min.js'))
  .pipe(gulp.dest('js/'))
)

gulp.task ('default', ['styles', 'fb', 'scripts'])
