var url = require('url');
var semver = require('semver');
var path = require('path');
var http = require('http');
var fs = require('fs');
var mime = require('mime');
var httpProxy = require('http-proxy');
var send = require('send');
var async = require('async');

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

  var prefix =  options.prefix;

  var proxy = httpProxy.createProxyServer();

  return require('http').createServer(function(req, res) {
    var p = url.parse(req.url);
    if(!req.url.match(base)) {
      proxy.web(req, res, { target: p.protocol + '//' + p.host });
    }else {
      var u = req.url;
      var fpath = u.replace(base, '');
      
      fpath = fpath.replace(/^\/?/, '');

      if (fpath.match(new RegExp('^' + prefix.mod + '\/'))) {
        fpath = path.join(modir, normalize(fpath, prefix.mod + '\/'));
        var ext = path.extname(fpath);
        fpath = fpath.replace(new RegExp('\.min' + ext + '$'), ext);
        fs.exists(fpath, function(exists) {
          if(exists)
            send(req, fpath).pipe(res);
          else {
            console.warn(['"', fpath, '"', ' is not exists'].join(''));
            proxy.web(req, res, {target: p.protocol + '//' + p.host });
          }
        });
      }else if (fpath.match(new RegExp('^' + prefix.concat + '\/'))) {
        if (!res.getHeader('Content-Type')){ // set type header
          var type = mime.lookup(fpath);
          var charset = mime.charsets.lookup(type);
          res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
        }

        fpath = normalize(fpath,  prefix.concat + '\/');
        var files = fpath.split(',');
        files = files.map(function(p) {
          return path.join(modir,  normalize(p.replace(/~/g, '/'), '\/?' + prefix.mod +'\/'));
        }).map(function(p) {
          var ext = path.extname(p);
          return p.replace(new RegExp('\.min\.' + ext + '$'), '.' + ext);
        });;

        var content = [];
        async.eachSeries(files, function(file, cb){
          fs.stat(file, function(err, stat) {
            if (err) {
              var notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
              if (~notfound.indexOf(err.code)) {
                console.log(file + 'is not found');
                content.push('// ' + file + ' is missing');
                cb();
              } else
                  cb(err);
            }else {
              if (stat.isDirectory()) {
                console.log(file + 'is directory');
                return cb();
              }

              fs.readFile(file, 'utf8', function(err, data) {
                content.push(data);
                cb();
              });
            }
          });
        }, function(err) {
          if(err) {
            console.error(err);
            res.statusCode = 500;
            return res.end();
          }

          var data = content.join('\n');
          res.setHeader('Content-Length', Buffer.byteLength(data));
          res.write(data);
          res.end();
        });
      }
    }
  });
}

function normalize(urlpath, prefix) {
  return urlpath.replace(new RegExp('^' + prefix), '');
}

