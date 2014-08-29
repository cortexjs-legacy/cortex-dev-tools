#!/usr/bin/env node



var yargs = require('yargs')
  .version(require('../package.json').version)
  .usage('Start debug server for development.\nUsage: $0')
  .example('$0 [-p,--port 5051]  [-E, --env beta] [-b, --base host.com]', 'start debug server on current folder')
  .alias('env', 'E')
  .describe('env', 'environment')
  .alias('p', 'port')
  .describe('p', 'running port')
  .alias('base', 'b')
  .describe('base', 'base host url')
  .alias('h', 'help')
  .describe('h', 'show help');

var argv = yargs.argv;

if (argv.h || argv.help) {
  console.log(yargs.help());
  process.exit(0);
}


var port = argv.p || argv.port || 5051;
var env = argv.E || argv.env; 
var prefix_mod = argv['prefix-mod'] || 'mod';
var base = argv.b || argv.base;

var createDebugServer = require('../lib/debug-server');

var server = createDebugServer({
  base: base,
  env: env,
  cwd: argv.cwd || process.cwd(),
  prefix: {
    mod: prefix_mod
  }
});

server.listen(port);
console.log("Start debug server to listen port: " + port + "...");


