'use strict';

var express    = require('express'),
    liveReload = require('connect-livereload'),
    app;

app = express();

app.use(liveReload());

app.get('/', function (req, res) {
  res.send('Welcome!');
});

app.listen(1337);