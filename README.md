gulp-dev-server
===============
[![status][travisImage]][travisLink] [![downloads][downloadCount]][npmLink]

[travisImage]: http://img.shields.io/travis/MrBoolean/gulp-dev-server/master.svg?style=flat-square
[travisLink]: https://travis-ci.org/MrBoolean/gulp-dev-server

[downloadCount]: http://img.shields.io/npm/dm/gulp-dev-server.svg?style=flat-square
[npmLink]: https://www.npmjs.com/package/gulp-dev-server

With `gulp-dev-server` you can simplify your development environment easy and uncomplicated. The annoying stopping and starting your script has an end.

## Usage
    var Server = require('gulp-dev-server');

    // ...

    gulp.task('dev', function () {
      Server.task({
        restart: ['lib/**/*.js'],
        notify: ['static/**/*.js'],
        server: {
          script: { path: 'server.js' }
        }
      })
    });

## Contribute
If you want to improve my `gulp` plugin you should remember the coding standard:

- Just one `var`
- Single quotes
- No trailing spaces
- No underscore dandle
- Yoda style
- Intend of 2 spaces

You can find more details in `.eslintrc` and `.editorconfig`.