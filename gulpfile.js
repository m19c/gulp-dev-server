var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var rs = require('run-sequence');
var doc = require('./lib/gulp/doc');

gulp.task('test.instrument', function instrument() {
  return gulp
    .src(['lib/**/*.js', '!lib/gulp/doc.js', '!dist/**/*', 'index.js'])
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire())
  ;
});

gulp.task('test', ['test.instrument'], function test() {
  return gulp
    .src(['test/**/*.test.js'])
    .pipe(mocha({
      // require: ['./test/bootstrap']
    }))
    .pipe(istanbul.writeReports({
      dir: './dist/test-report'
    }))
  ;
});

gulp.task('lint', function lint() {
  gulp
    .src([
      'lib/**/*.js',
      'test/**/*.js',
      'gulpfile.js'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
  ;
});

gulp.task('doc', function generateDoc() {
  gulp.src(['lib/**/*.js'])
    .pipe(doc({
      destination: 'dist/doc'
    }));
});

gulp.task('default', function defaultTask(done) {
  rs('lint', 'test', done);
});