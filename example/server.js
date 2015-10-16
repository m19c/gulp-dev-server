var express = require('express');
var liveReload = require('connect-livereload');
var app;

app = express();

app.use(liveReload());

app.get('/', function(req, res) {
  res.send('Welcome!');
});

app.listen(1337);