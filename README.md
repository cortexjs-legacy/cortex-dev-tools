# cortex-dev-tools [![NPM version](https://badge.fury.io/js/cortex-dev-tools.svg)](http://badge.fury.io/js/cortex-dev-tools) [![Build Status](https://travis-ci.org/cortexjs/cortex-dev-tools.svg?branch=master)](https://travis-ci.org/cortexjs/cortex-dev-tools) [![Dependency Status](https://gemnasium.com/cortexjs/cortex-dev-tools.svg)](https://gemnasium.com/cortexjs/cortex-dev-tools)

A tools set for development usage when using cortex.

## Install

```bash
$ npm install cortex-dev-tools -g
```

## Usage


### proxy

Start proxy in dev folder of your module (You should run `cortex install` and `cortex build` before debug):

```bash
$ ctx-proxy -b www.example.com -p 5050
```

Then configure proxy of your browser to `localhost:5050`. Refresh the page, js/css files will be loaded from your local directory.


## Licence

MIT
