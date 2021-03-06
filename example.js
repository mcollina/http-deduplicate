'use strict'

var http = require('http')
var deduplicate = require('./')()
var fs = require('fs')
var pump = require('pump')
var p = require('path')

// creating the slow server
http.createServer(function (req, res) {
  pump(
    fs.createReadStream(p.join(__dirname, 'package.json')),
    res)
}).listen(3001, function () {
  console.log('slow server listening on', this.address().port)
})

http.createServer(function (req, res) {
  deduplicate('http://localhost:3001/', function (err, data, cb) {
    if (err) {
      res.statusCode(500)
      res.end()
      return
    }

    setTimeout(function () {
      res.end(data)
      cb()
    }, Math.floor(Math.random() * 10) + 1)
  })
}).listen(3000, function () {
  console.log('server listening on', this.address().port)
})
