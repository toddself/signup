'use strict'

const test = require('tap').test
const mysql = require('mysql')

const runServer = require('../signup')

test('no errors', function (t) {
  mysql.createConnection = function () {
    return {
      connect: (cb) => cb(),
      query: (string, cb) => cb(),
      escape: (x) => x
    }
  }

  runServer(function (err, conn, server) {
    t.error(err, 'server started')
    t.ok(conn)
    t.ok(server)
    server.close()
    t.end()
  })
})

test('no connection', function (t) {
  mysql.createConnection = function () {
    return {
      connect: (cb) => cb(new Error('nope')),
      query: (string, cb) => cb(),
      escape: (x) => x
    }
  }

  runServer(function (err, conn, server) {
    t.ok(err, 'server did not start')
    t.end()
  })
})
