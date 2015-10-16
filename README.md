gulp-dev-server
===============
[![status][travisImage]][travisLink] [![downloads][downloadCount]][npmLink] [![Code Climate](https://codeclimate.com/github/MrBoolean/gulp-dev-server/badges/gpa.svg)](https://codeclimate.com/github/MrBoolean/gulp-dev-server) [![Test Coverage](https://codeclimate.com/github/MrBoolean/gulp-dev-server/badges/coverage.svg)](https://codeclimate.com/github/MrBoolean/gulp-dev-server/coverage)

[travisImage]: http://img.shields.io/travis/MrBoolean/gulp-dev-server/master.svg?style=flat-square
[travisLink]: https://travis-ci.org/MrBoolean/gulp-dev-server
[downloadCount]: http://img.shields.io/npm/dm/gulp-dev-server.svg?style=flat-square
[npmLink]: https://www.npmjs.com/package/gulp-dev-server

With `gulp-dev-server` you can simplify your development environment easy and uncomplicated. The annoying stopping and starting your script has an end.

## Install
```
npm i --save-dev gulp-dev-server
```

## Usage
```javascript
var gds = require('gulp-dev-server');

// ...

gulp.task('dev', function () {
  gds.task({
    restart: ['lib/**/*.js'],
    notify: ['static/**/*.js'],
    server: {
      environment: 'development',
      script: { path: 'server.js' }
    }
  })
});
```

# License
Copyright (c) 2015 Marc Binder <marcandrebinder@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.