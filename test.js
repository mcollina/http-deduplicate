'use strict'

var deduplicator = require('./')
var test = require('tap').test
var http = require('http')
var https = require('https')
var pem = require('pem')

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

test('https support', function (t) {
  t.plan(3)

  pem.createCertificate({
    days: 1,
    selfSigned: true
  }, function (err, keys) {
    if (err) {
      t.threw(err)
      return
    }

    var server = https.createServer({
      key: keys.serviceKey,
      cert: keys.certificate
    }, function (req, res) {
      t.ok('request received')
      res.end('hello')
    }).listen(0, function () {
      var deduplicate = deduplicator()
      var address = server.address()

      deduplicate({
        protocol: 'https:',
        hostname: 'localhost',
        port: address.port,
        rejectUnauthorized: false
      }, check)

      function check (err, data) {
        t.error(err)
        t.deepEqual(data, new Buffer('hello'))
      }
    })

    t.tearDown(server.close.bind(server))
  })
})

test('deduplicate with temporary store', function (t) {
  t.plan(8)

  var server = http.createServer(function (req, res) {
    t.ok('request received')
    res.end('hello')
  }).listen(0, function () {
    var deduplicate = deduplicator()
    var address = server.address()
    var dest = 'http://localhost:' + address.port

    deduplicate(dest, function check (err, data, cb) {
      t.error(err)
      t.deepEqual(data, new Buffer('hello'))

      deduplicate(dest, function check (err, data) {
        t.error(err)
        t.deepEqual(data, new Buffer('hello'))

        // clear the temporary store opened by the first request
        cb()

        // this will cause a request to be received
        deduplicate(dest, function check (err, data) {
          t.error(err)
          t.deepEqual(data, new Buffer('hello'))
        })
      })
    })
  })

  t.tearDown(server.close.bind(server))
})
