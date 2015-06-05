var through2   = require('through2'),
    path       = require('path'),
    spawn      = require('child_process').spawn,
    merge      = require('lodash.merge');

module.exports = function (options) {
  'use strict';

  options = merge({
    destination: null,
    args: []
  }, options || {});

  var stack = [],
      stream;

  stream = through2.obj({}, undefined, function (done) {
    options.args.push('-d', options.destination);

    stack.forEach(function (file) {
      options.args.push(file);
    });

    var runner = spawn('./node_modules/.bin/jsdoc', options.args);

    runner.stdout.on('data', function (message) {
      console.log(message.toString());
    });

    runner.stderr.on('data', function (message) {
      console.log(message.toString());
    });

    runner.on('error', function () {
      console.log(arguments);
    });

    runner.on('close', function () {
      done();
    });
  });

  stream.on('data', function (info) {
    stack.push(path.relative(process.cwd(), info.path));
  });

  return stream;
};