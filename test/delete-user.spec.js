'use strict'

const test = require('tap').test
const request = require('request')

const testSetup = require('./test-setup')
const removeUser = require('../remove-user')
const config = require('../config')

const router = {
  DELETE: {
    '/remove': removeUser
  }
}

test('remove user no mysql fail', function (t) {
  testSetup('mysqlSuccess', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('has hash', function (t) {
      const opts = {
        method: 'DELETE',
        url: 'http://127.0.0.1:3000/remove?hash=1234'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        body = JSON.parse(body)
        t.equal(body.message, 'You have been removed from the list', 'got success')
        t.equal(resp.statusCode, 200, 'got a 200')
        t.end()
      })
    })

    test('no hash', function (t) {
      const opts = {
        method: 'DELETE',
        url: 'http://127.0.0.1:3000/remove'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 400, 'bad data')
        body = JSON.parse(body)
        t.equal(body.message, 'Missing hash in URL')
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

test('remove user bad mysql query', function (t) {
  testSetup('mysqlQueryFail', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('unable to select', function (t) {
      const opts = {
        method: 'DELETE',
        url: 'http://127.0.0.1:3000/remove?hash=1234'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        body = JSON.parse(body)
        t.equal(body.message, `Unable to remove user, please email ${config.email.address}`, 'got failure')
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
