var gulp = require('gulp');
var util = require('gulp-util');
var merge = require('lodash.merge');
var clone = require('lodash.clone');
var isUndefined = require('lodash.isundefined');
var Promise = require('bluebird');
var path = require('path');
var spawn = require('child_process').spawn;
var EventEmitter = require('eventemitter2').EventEmitter2;
var eventStream = require('event-stream');
var listenLiveReload = require('tiny-lr');
var chalk = require('chalk');

/**
 * Represents a server
 *
 * @constructor
 * @author  Marc Binder <marcandrebinder@gmail.com>
 *
 * @license
 * Copyright (c) 2015 Marc Binder
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @param  {object} config The configuration
 *
 * @emits Server#error
 *
 * @listens Server#error
 * @listens Server#liveReload.ready
 * @listens Server#stdout
 * @listens Server#stderr
 * @listens Server#exit
 * @listens Server#changed
 *
 * @property {string}   config.cwd                      The process root path
 * @property {string}   config.executable               If defined the executable path is used instead of the script.path
 * @property {string}   config.script.runner            `node` / `io` js executable
 * @property {string}   config.script.path              The script
 * @property {array}    config.process.args             The arguments passed to the process
 * @property {object}   config.process.options          The options passed to the process
 * @property {string}   config.process.encoding         The encoding (defaults to `utf8`)
 * @property {boolean}  config.liveReload.enabled       Enable or disable the `liveReload` plugin
 * @property {object}   config.liveReload.options       The liveReload options
 * @property {number}   config.liveReload.options.port  The liveReload port
 * @property {boolean}  config.verbose                  Enables / disables the verbose output
 */
function Server(config) {
  /**
   * @event Server#error
   * @param {Error|mixed} err The error
   */

  /**
   * @event Server#changed
   */

  /**
   * @event Server#liveReload.ready
   */

  /**
   * @event Server#stdout
   * @param {string} value
   */

  /**
   * @event Server#stderr
   * @param {string} value
   */

  /**
   * @event Server#exit
   * @param {number} code
   * @param {string} signal
   */

  /** @lends Server.prototype */
  var self = this;
  var ee = new EventEmitter();
  var server;
  var liveReloadServer;
  var notifyTimeout;
  var notifyStack;

  /** @type {config} */
  self.config = merge({
    cwd: process.cwd(),
    executable: null,
    script: {
      runner: process.execPath,
      path: null
    },
    process: {
      args: [],
      options: {},
      encoding: 'utf8'
    },
    environment: null,
    liveReload: {
      enabled: true,
      options: {
        port: 35729
      }
    },
    verbose: false
  }, config || {});

  function debug() {
    if (!self.config.verbose) {
      return;
    }

    util.log.apply(util, arguments);
  }

  if (self.config.verbose) {
    ee.on('error', function(err) {
      if (err instanceof Error) {
        return debug(chalk.bold.red(err.message), err.stack);
      }

      debug(chalk.bold.red(err));
    });

    ee.on('liveReload.ready', function() {
      debug(chalk.blue('liveReload ready'));
    });

    ee.on('stdout', function(value) {
      debug(chalk.gray(value));
    });

    ee.on('stderr', function(value) {
      debug(chalk.bold.red(value));
    });

    ee.on('exit', function(value) {
      debug(chalk.blue('Process exited (' + value + ')'));
    });

    ee.on('changed', function(value) {
      debug(chalk.gray('Changed'), value);
    });
  }

  /**
   * @emits Server#error
   * @emits Server#liveReload.ready
   * @emits Server#stdout
   * @emits Server#stderr
   * @emits Server#exit
   *
   * @return {Promise}
   */
  self.start = function start() {
    debug(chalk.gray('Attemp to start the server'));

    return new Promise(function(resolve, reject) {
      var err;
      var executable;
      var args = clone(self.config.process.args);
      var options = clone(self.config.process.options);

      if (server) {
        return reject(new Error('Server already running'));
      }

      if (self.config.executable === null && self.config.script.path === null) {
        err = new Error('No executable or script.path defined');
        ee.emit('error', err);
        return reject(err);
      }

      if (self.config.executable && self.config.script.path) {
        err = new Error('executable and script.path are defined - choose one!');

        ee.emit('error', err);
        return reject(err);
      }

      if (self.config.liveReload.enabled && !liveReloadServer) {
        liveReloadServer = listenLiveReload(self.config.liveReload.options);
        liveReloadServer.listen(self.config.liveReload.options.port, function() {
          ee.emit('liveReload.ready');
        });
      }

      executable = self.config.executable;

      if (executable === null) {
        executable = self.config.script.runner;
        args.push(self.config.script.path);
      }

      if (self.config.environment) {
        options = self.config.process.options || {};
        options.env = self.config.process.options.env || {};
        options.env.NODE_ENV = self.config.environment;
      }

      server = spawn(
        executable,
        args,
        options
      );

      server.stdout.setEncoding(self.config.process.encoding);
      server.stderr.setEncoding(self.config.process.encoding);

      server.stdout.on('data', function(data) {
        ee.emit('stdout', data);
      });

      server.stderr.on('data', function(data) {
        ee.emit('stderr', data);
      });

      server.once('exit', function(code, signal) {
        process.nextTick(function() {
          ee.emit('exit', code, signal);
        });
      });

      process.once('exit', function(code, signal) {
        ee.emit('exit', code, signal);
      });

      debug(chalk.gray('Server started'));

      resolve(server);
    });
  };

  /**
   * @emits Server#error
   *
   * @return {Promise}
   */
  self.stop = function stop(stopLiveReloadServer) {
    stopLiveReloadServer = (isUndefined(stopLiveReloadServer)) ? true : stopLiveReloadServer;

    debug(chalk.gray('Attemp to stop the server'));

    return new Promise(function(resolve, reject) {
      var err;

      if (!server) {
        err = new Error('Server not running');

        ee.emit('error', err);
        return reject(err);
      }

      server.once('exit', function(code) {
        resolve(code);
      });

      if (stopLiveReloadServer && liveReloadServer) {
        liveReloadServer.close();
        liveReloadServer = undefined;
      }

      server.kill('SIGKILL');
      server = undefined;

      debug(chalk.gray('Server stopped'));
    });
  };

  /**
   * @emits Server#error
   * @emits Server#liveReload.ready
   * @emits Server#stdout
   * @emits Server#stderr
   * @emits Server#exit
   *
   * @return {Promise}
   */
  self.restart = function restart() {
    return self.stop(false)
      .then(self.start);
  };

  /**
   * @param  {object} info
   * @return {Server}
   */
  self.notify = function(info) {
    if (!info || !info.path) {
      return this;
    }

    if (notifyTimeout) {
      clearTimeout(notifyTimeout);
    }

    notifyStack = notifyStack || [];
    notifyStack.push(path.relative(__dirname, info.path));

    notifyTimeout = setTimeout(function() {
      ee.emit('changed', notifyStack);

      liveReloadServer.changed({
        body: {
          files: notifyStack
        }
      });

      notifyStack = undefined;
    }, 200);

    return self;
  };

  /**
   * @param  {mixed=} info
   * @return {Stream}
   */
  self.watchAndNotify = function watchAndNotify(info) {
    if (info) {
      self.notify(info);
    }

    return eventStream.map(function(file, done) {
      self.notify(file);
      done(null, file);
    });
  };

  /**
   * Adds a listener to the end of the listeners array for the specified event.
   *
   * @param  {string}    event     The event name as a string
   * @param  {function}  listener  The listener function
   * @return Server
   */
  self.on = function on(event, listener) {
    ee.on(event, listener);
  };

  /**
   * @param  {string}    event     The event name as a string
   * @param  {function}  listener  The listener function
   * @return Server
   */
  self.once = function once(event, listener) {
    ee.once(event, listener);
    return self;
  };

  /**
   * Remove a listener from the listener array for the specified event.
   * Caution: changes array indices in the listener array behind the
   * listener.
   *
   * @param  {string}    event     The event name as a string
   * @param  {function}  listener  The listener function
   * @return Server
   */
  self.off = function off(event, listener) {
    ee.off(event, listener);
    return self;
  };
}

/**
 * @param  {object} gulp   An instance of `gulp`
 * @param  {object} config The configuration object.
 *
 * @property {array}  config.notify
 * @property {array}  config.restart
 * @property {object} config.server   The server configuration (described above)
 *
 * @return {Server}
 */
Server.task = function task(config) {
  var server;

  config = merge({
    notify: [],
    restart: [],
    server: null
  }, config || {});

  server = new Server(config.server);

  server.start();

  gulp.watch(config.notify, server.notify);
  gulp.watch(config.restart, server.restart);

  return server;
};

module.exports = Server;