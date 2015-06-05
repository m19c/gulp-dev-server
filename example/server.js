'use strict';

var express = require('express'),
    app;

app = express();

app.get('/', function (req, res) {
  res.send('Harmony Test!');
});

app.listen(1337);