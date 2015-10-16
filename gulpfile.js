var info = require('./package.json');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var sequence = require('gulp-sequence');
var jsdoc = require('gulp-jsdoc');
var notify = require('gulp-notify');
var ghp = require('gulp-gh-pages');

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
    .pipe(mocha())
    .pipe(istanbul.writeReports({
      dir: './dist/test-report'
    }))
    .pipe(notify({
      title: info.name,
      message: 'Tests done'
    }))
  ;
});

gulp.task('lint', function lint() {
  gulp
    .src([
      '**/*.js',
      '!node_modules/**/*',
      '!dist/**/*'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(notify({
      title: info.name,
      message: 'Lint done'
    }))
  ;
});

gulp.task('doc', function doc() {
  return gulp
    .src(['lib/**/*.js', 'index.js', 'README.md'])
    .pipe(jsdoc.parser({
      name: 'tb',
      plugins: ['plugins/markdown']
    }))
    .pipe(jsdoc.generator('./dist/doc', {
      path: 'ink-docstrap',
      systemName: 'tb',
      footer: '',
      copyright: '2015 MrBoolean',
      navType: 'vertical',
      theme: 'flatly',
      linenums: true,
      collapseSymbols: false,
      inverseNav: false
    }))
    .pipe(notify({
      title: info.name,
      message: 'Doc done'
    }))
  ;
});

gulp.task('doc.deploy', ['doc'], function gitHubPage() {
  return gulp
    .src('dist/doc/tb/**/*')
    .pipe(ghp())
  ;
});

gulp.task('default', sequence('lint', 'test'));