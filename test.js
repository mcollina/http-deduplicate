'use strict'

var deduplicator = require('./')
var test = require('tap').test
var http = require('http')

test('basic callback request', function (t) {
  t.plan(3)

  var server = http.createServer(function (req, res) {
    t.ok('request received')
    res.end('hello')
  }).listen(0, function () {
    var deduplicate = deduplicator()
    var address = server.address()
    var dest = 'http://localhost:' + address.port

    deduplicate(dest, check)

    function check (err, data) {
      t.error(err)
      t.deepEqual(data, new Buffer('hello'))
    }
  })

  t.tearDown(server.close.bind(server))
})

test('deduplicate', function (t) {
  t.plan(5)

  var server = http.createServer(function (req, res) {
    t.ok('request received')
    res.end('hello')
  }).listen(0, function () {
    var deduplicate = deduplicator()
    var address = server.address()
    var dest = 'http://localhost:' + address.port

    deduplicate(dest, check)
    deduplicate(dest, check)

    function check (err, data) {
      t.error(err)
      t.deepEqual(data, new Buffer('hello'))
    }
  })

  t.tearDown(server.close.bind(server))
})
