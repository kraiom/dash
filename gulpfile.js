var gulp        = require('gulp'),
    less        = require ('gulp-less'),
    minifyCSS   = require('gulp-minify-css'),
    rename      = require('gulp-rename'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify')
    order       = require('gulp-order');

gulp.task ('styles', function () {
    return gulp
    .src('css/less/*.less')
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(concat('css.css'))
    .pipe(gulp.dest('css/'));
});

gulp.task ('dash', function () {
    return gulp
    .src('js/dash/*.js')
    .pipe(order([
        'js/dash/dash-utils.js',
        'js/dash/*.js'
    ]))
    .pipe(uglify())
    .pipe(concat('dash.min.js'))
    .pipe(gulp.dest('js/assets/'));
});

gulp.task ('fb', function () {
    return gulp
    .src('js/libs/fb.js')
    .pipe(uglify())
    .pipe(concat('fb.min.js'))
    .pipe(gulp.dest('js/libs/'));
});

gulp.task ('libs', function () {
    return gulp
    .src([
        'js/libs/jquery*',
        'js/libs/keypress*',
        'js/libs/hammer.min.js'
    ])
    .pipe(uglify())
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('js/assets/'));
});

gulp.task ('scripts', ['dash', 'libs'], function () {
    return gulp
    .src('js/assets/*.js')
    .pipe(uglify())
    .pipe(order([
        'libs.min.js',
        'dash.min.js',
        'common.js'
    ]), { base: './js/assets' })
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest('js/'));
});

gulp.task ('default', ['styles', 'fb', 'scripts']);