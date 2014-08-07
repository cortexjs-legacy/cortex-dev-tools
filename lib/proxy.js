var url = require('url');
var semver = require('semver');
var path = require('path');
var http = require('http');
var fs = require('fs');
var httpProxy = require('http-proxy');
var send = require('send');

module.exports = createProxyServer;


function createProxyServer(options) {
  var cwd = options.cwd;
  var base = options.base;

  if (!cwd) 
    throw new Error('cwd must be provided for proxy');

  if (!base)
    throw new Error('base must be provided for proxy');

  var modir = path.join(cwd, 'neurons');
  if (!fs.existsSync(modir)) {
    throw new Error("Can not find `neurons` folder in " + cwd);
  }

  if (!base.match(/^https?:\/\//)) {
    base = 'http:\/\/' + base;
  }

  if (typeof base == 'string')
    base = new RegExp("(" + base + ")");

  var proxy = httpProxy.createProxyServer();

  return require('http').createServer(function(req, res) {
    var p = url.parse(req.url);
    if(!req.url.match(base)) {
      proxy.web(req, res, { target: p.protocol + '//' + p.host });
    }else {
      var u = req.url;
      var fpath = u.replace(base, '');
      fpath = path.join(modir, fpath);

      fs.exists(fpath, function(exists) {
        if(exists)
          send(req, fpath).pipe(res);
        else {
          console.warn(['"', fpath, '"', ' is not exists'].join(''));
          proxy.web(req, res, {target: p.protocol + '//' + p.host });
        }
      });
    }
  });
}


