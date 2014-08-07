#!/usr/bin/env node
var url = require('url');
var http = require('http');
var httpProxy = require('http-proxy');

//
// Create your proxy server and set the target in the options.
//
var proxy = httpProxy.createProxyServer();


var server = require('http').createServer(function(req, res) {
  // You can define here your custom logic to handle the request
  // and then proxy the request.
  console.log(req.url, url.parse(req.url));
  var p = url.parse(req.url);
  proxy.web(req, res, { target: p.protocol + '//' + p.host });
});

console.log("listening on port 5050");
server.listen(5050);


