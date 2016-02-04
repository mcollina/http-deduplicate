'use strict'

var Map = require('es6-map')
var http = require('http')
var https = require('https')
var bl = require('bl')
var URL = require('url')
var steed = require('steed')()
var nextTick = require('process-nextick-args')
var protocols = {
  'https:': https,
  'http:': http
}

function deduplicator () {
  var queues = new Map()
  var each = steed.each
  var temporaries = new Map()

  return deduplicate

  function deduplicate (address, cb) {
    var options
    if (typeof address === 'string') {
      options = URL.parse(address)
    } else {
      options = address
      address = URL.format(address)
    }
    var temp = temporaries.get(address)
    if (temp) {
      nextTick(cb, null, temp, noop)
      return
    }
    var queue = queues.get(address)
    if (queue) {
      queue.push(cb)
      return
    } else {
      queues.set(address, [cb])
      // let's defer the setup
      // when we have some free cycles
      setImmediate(
        fillResult,
        protocols[options.protocol].get(options),
        address)
    }
  }

  function fillResult (req, address) {
    var result = bl(onData)
    result.address = address
    req.result = result
    req.on('response', autopipe)
  }

  function onData (err, data) {
    var address = this.address

    var queue = queues.get(address)
    queues.delete(address)

    temporaries.set(address, data)

    each(new State(err, data, address), queue, push, clear)
  }

  function push (toCall, done) {
    if (toCall.length === 3) {
      toCall(this.err, this.data, done)
    } else {
      toCall(this.err, this.data)
      nextTick(done)
    }
  }

  function clear () {
    temporaries.delete(this.address)
  }
}

function State (err, data, address) {
  this.err = err
  this.data = data
  this.address = address
}

function autopipe (res) {
  res.pipe(this.result)
}

function noop () {}

module.exports = deduplicator
