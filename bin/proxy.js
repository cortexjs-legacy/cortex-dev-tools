#!/usr/bin/env node

var argv = require('yargs').argv;


var port = argv.p || argv.port || 5050;
var base = argv.b || argv.base;

var createProxyServer = require('../lib/proxy');

var server = createProxyServer({
  base: base,
  cwd: argv.cwd || process.cwd()
});

server.listen(port);
console.log("Start proxy to listen port: " + port + "...");
