#!/usr/bin/env node

var yargs = require('yargs')
  .version(require('../package.json').version)
  .usage('Start proxy server for development.\nUsage: $0')
  .example('$0 [-p,--port 5050]  [-b, --base host.com]', 'count the lines in the given file')
  .alias('b', 'base')
  .describe('b', 'base host')
  .alias('p', 'port')
  .describe('p', 'running port')
  .alias('h', 'help')
  .describe('h', 'show help');

var argv = yargs.argv;

if (argv.h || argv.help) {
  console.log(yargs.help());
  process.exit(0);
}


var port = argv.p || argv.port || 5050;
var base = argv.b || argv.base;
var prefix_mod = argv['prefix-mod'] || 'mod';
var prefix_concat = argv['prefix-concat'] || 'concat';

var createProxyServer = require('../lib/proxy');

var server = createProxyServer({
  base: base,
  cwd: argv.cwd || process.cwd(),
  prefix: {
    mod: prefix_mod,
    concat: prefix_concat
  }
});

server.listen(port);
console.log("Start proxy to listen port: " + port + "...");
