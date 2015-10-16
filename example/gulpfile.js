var gulp = require('gulp');
var gds = require('../');

gulp.task('dev', function() {
  gds.task({
    notify: ['./server.js'],
    restart: ['./server.js'],
    server: {
      script: { path: 'server.js' },
      verbose: true
    }
  });
});