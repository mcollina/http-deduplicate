'use strict'

var Map = require('es6-map')
var http = require('http')
var https = require('https')
var bl = require('bl')
var URL = require('url')

function deduplicator () {
  var queues = new Map()

  return deduplicate

  function deduplicate (address, cb) {
    var options
    if (typeof address === 'string') {
      options = URL.parse(address)
    } else {
      options = address
      address = URL.format(address)
    }
    var queue = queues.get(address)
    if (queue) {
      queue.push(cb)
      return
    } else {
      queues.set(address, [cb])
      trigger(address, options)
    }
  }

  function trigger (address, options) {
    var result = bl(function (err, data) {
      var queue = queues.get(address)
      queues.delete(address)

      queue.forEach(push, { err: err, data: data })
    })

    var protocol = http

    if (options.protocol === 'https:') {
      protocol = https
    }

    protocol.get(options).on('response', function (res) {
      res.pipe(result)
    })
  }

  function push (cb) {
    cb(this.err, this.data)
  }
}

module.exports = deduplicator
