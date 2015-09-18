'use strict'

const test = require('tap').test
const mockMailer = require('mockmailer')
const request = require('request')

const testSetup = require('./test-setup')
const addUser = require('../add-user')

const router = {
  POST: {
    '/add': addUser
  }
}

test('add user no mysql fail', function (t) {
  testSetup('mysqlSuccess', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('user signup', function (t) {
      t.plan(6)
      mockMailer(function (err, message) {
        t.error(err, 'message sent')
        t.ok(message, 'received a payload')
      })

      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        json: true,
        body: {email: 'test@example.com'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(body.message, 'success', 'got success')
        t.equal(body.statusCode, 201, 'got a 201')
        t.equal(resp.statusCode, 201, 'got a 201')
      })
    })

    test('bad email', function (t) {
      t.plan(3)
      mockMailer(function (err, message) {
        t.ok(err, 'should not be here')
        t.notOk(message, 'should not have sent an email')
      })

      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        json: true,
        body: {email: 'fd@d'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 400, 'bad data')
        t.equal(body.message, 'fd@d is not a valid email address')
      })
    })

    test('email cannot send', function (t) {
      t.plan(4)
      mockMailer.setFail(true)
      mockMailer(function (err) {
        t.ok(err, 'received a send error')
        mockMailer.setFail(false)
      })

      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        json: true,
        body: {email: 'test@example.com'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 500, 'got a 500 back')
        t.equal(body.message, 'Unable to add test@example.com to list', 'got error')
      })
    })

    test('bad mime-type', function (t) {
      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        headers: {
          'content-type': 'text/plain'
        },
        body: 'whatever'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 400, 'got back a 400')
        body = JSON.parse(body)
        t.equal(body.message, 'Expected application/json', 'got back error message')
        t.end()
      })
    })

    test('unparse-able json', function (t) {
      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        headers: {
          'content-type': 'application/json'
        },
        body: 'whatever, brah'
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 400, 'got back a 400')
        body = JSON.parse(body)
        t.equal(body.message, 'Sorry whatever, brah is not a valid request', 'got back error message')
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

test('add user bad mysql query', function (t) {
  testSetup('mysqlQueryFail', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('unable to insert', function (t) {
      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/add',
        json: true,
        body: {email: 'test@example.com'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(body.message, 'An error occurred updating list', 'got failure')
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
