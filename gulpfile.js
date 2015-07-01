'use strict';

var gulp     = require('gulp'),
    eslint   = require('gulp-eslint'),
    mocha    = require('gulp-mocha'),
    coverage = require('gulp-coverage'),
    rs       = require('run-sequence'),
    doc      = require('./lib/gulp/doc');

gulp.task('test', function () {
  gulp
    .src(['test/**/*.test.js'], { read: false })
    .pipe(coverage.instrument({
      pattern:        ['lib/**/*.js'],
      debugDirectory: 'dist/debug'
    }))
    .pipe(mocha())
    .pipe(coverage.gather())
    .pipe(coverage.format([
      {
        reporter: 'html',
        outFile:  'coverage.html'
      },
      {
        reporter: 'lcov',
        outFile:  'coverage.lcov'
      }
    ]))
    .pipe(gulp.dest('dist/report'))
  ;
});

gulp.task('lint', function () {
  gulp
    .src([
      'lib/**/*.js',
      'test/**/*.js',
      'gulpfile.js'
    ])
    .pipe(eslint({
      configFile: '.eslintrc'
    }))
    .pipe(eslint.format())
  ;
});

gulp.task('doc', function () {
  gulp.src(['lib/**/*.js'])
    .pipe(doc({
      destination: 'dist/doc'
    }))
  ;
});

gulp.task('default', function (done) {
  rs('lint', 'test', done);
});