var url = require('url');
var semver = require('semver');
var path = require('path');
var http = require('http');
var fs = require('fs');
var util = require('util');
var mime = require('mime');
var httpProxy = require('http-proxy');
var send = require('send');
var async = require('async');

module.exports = createDebugServer;


function createDebugServer(options) {
  var env = options.env;
  var cwd = options.cwd;
  var base = options.base;

  if (!cwd) 
    throw new Error('cwd must be provided for proxy');

  var modir = path.join(cwd, 'neurons');
  if (!fs.existsSync(modir)) {
    throw new Error("Can not find `neurons` folder in " + cwd);
  }

  if (base && !base.match(/^https?:\/\//)) {
    base = 'http:\/\/' + base;
  }

  var prefix =  options.prefix;

  var proxy = httpProxy.createProxyServer();
  return require('http').createServer(function(req, res) {
    var p = url.parse(req.url);
    if(base && req.url.match(base)) {
      console.log(util.format('try proxy %s via %s', req.url, base));
      proxy.web(req, res, { target: base });
    }else {
      var fpath = req.url;
      fpath = fpath.replace(/^\/?/, '');
      if (fpath.match(new RegExp('^' + prefix.mod + '\/'))) {
        fpath = path.join(modir, normalize(fpath, prefix.mod + '\/'));
        fs.exists(fpath, function(exists) {
          if(exists)
            send(req, fpath).pipe(res);
          else {
            // test env
            if (env) {
              fpath = fpath.replace(new RegExp('-' + env), '');
              if (fs.existsSync(fpath)) {
                return send(req, fpath).pipe(res);
              }
            }

            if (base) {
              console.log(util.format('try proxy %s via %s', req.url, base));
              proxy.web(req, res, { target: base });
            }else {
              console.warn(['"', fpath, '"', ' is not exists'].join(''));
              res.writeHead(404);
              res.end();
            }
          }
        });
      }
    }
  });
}

function normalize(urlpath, prefix) {
  return urlpath.replace(new RegExp('^' + prefix), '');
}

