'use strict'

var Map = require('es6-map')
var http = require('http')
var bl = require('bl')

function deduplicator () {
  var queues = new Map()

  return deduplicate

  function deduplicate (address, cb) {
    var queue = queues.get(address)
    if (queue) {
      queue.push(cb)
      return
    } else {
      queues.set(address, [cb])
      trigger(address)
    }
  }

  function trigger (address) {
    var result = bl(function (err, data) {
      var queue = queues.get(address)
      queues.delete(address)

      queue.forEach(push, { err: err, data: data })
    })

    http.get(address).on('response', function (res) {
      res.pipe(result)
    })
  }

  function push (cb) {
    cb(this.err, this.data)
  }
}

module.exports = deduplicator
