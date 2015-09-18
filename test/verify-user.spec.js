'use strict'

const test = require('tap').test
const request = require('request')

const testSetup = require('./test-setup')
const verifyUser = require('../verify-user')

const router = {
  GET: {
    '/verify': verifyUser
  }
}

test('verify user no mysql fail', function (t) {
  testSetup('mysqlSuccess', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('has hash', function (t) {
      const opts = {
        method: 'GET',
        url: 'http://127.0.0.1:3000/verify?hash=1234'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        body = JSON.parse(body)
        t.equal(body.message, 'Thank you for verifying your address', 'got success')
        t.equal(resp.statusCode, 200, 'got a 200')
        t.end()
      })
    })

    test('no hash', function (t) {
      const opts = {
        method: 'GET',
        url: 'http://127.0.0.1:3000/verify'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 400, 'bad data')
        body = JSON.parse(body)
        t.equal(body.message, 'Missing hash')
        t.end()
      })
    })

    test('teardown', function (t) {
      server.close()
      t.end()
    })

    t.end()
  })
})

test('verify user bad mysql query', function (t) {
  testSetup('mysqlQueryFail', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('unable to select', function (t) {
      const opts = {
        method: 'GET',
        url: 'http://127.0.0.1:3000/verify?hash=1234'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        body = JSON.parse(body)
        t.equal(body.message, 'Unable to verify user', 'got failure')
        t.equal(resp.statusCode, 500, 'got a 500')
        t.end()
      })
    })

    test('teardown', function (t) {
      server.close()
      t.end()
    })

    t.end()
  })
})
