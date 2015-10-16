var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var Server = require('../');
var assert = chai.assert;

chai.use(chaiAsPromised);

describe('server', function() {
  it('rejects with an error if the obtained configuration does not include "script.path" or "executable"', function() {
    assert.isRejected((new Server()).start());
  });

  it('is observable', function() {
    var server = new Server();

    assert.isFunction(server.on);
    assert.isFunction(server.off);
  });

  it('is not possibile to trigger events (outside of the server file)', function() {
    var server = new Server();

    assert.isUndefined(server.emit);
  });

  describe('running server', function() {
    var server;

    beforeEach(function(done) {
      server = new Server({
        script: {
          path: '../example/server.js'
        }
      });

      server.start()
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    afterEach(function(done) {
      server.stop()
        .then(done)
        .catch(done);
    });

    it('rejects if the server is already running', function() {
      assert.isRejected(server.start());
    });
  });
});