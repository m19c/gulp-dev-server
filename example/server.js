'use strict';

var express    = require('express'),
    liveReload = require('connect-livereload'),
    app;

app = express();

app.use(liveReload());

app.get('/', function (req, res) {
  res.send('Harmony Test 2!');
});

app.listen(1337);