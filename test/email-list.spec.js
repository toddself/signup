'use strict'

const test = require('tap').test
const mockMailer = require('mockmailer')
const request = require('request')

const testSetup = require('./test-setup')
const emailList = require('../email-list')

const router = {
  POST: {
    '/emaillist': emailList
  }
}

test('emaillist user no mysql fail', function (t) {
  testSetup('mysqlSuccess', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('user signup', function (t) {
      let oldConn = conn.query
      conn.query = function (string, cb) {
        cb(null, [{email: 'test@example.com', hash: '1234'}])
      }

      mockMailer(function (err, message) {
        t.error(err, 'message sent')
        t.ok(/removeuser/.test(message.options.text), 'remove user is present')
        t.ok(/testpost/.test(message.options.text), 'post url is present')
      })

      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/emaillist',
        json: true,
        body: {url: '/testpost'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(body.message, 'success', 'got success')
        t.equal(resp.statusCode, 200, 'got a 200')
        conn.query = oldConn
        t.end()
      })
    })

    test('cannot send email', function (t) {
      let oldConn = conn.query
      conn.query = function (string, cb) {
        cb(null, [{email: 'test@example.com', hash: '1234'}])
      }

      mockMailer.setFail(true)
      mockMailer(function (err) {
        t.ok(err, 'no mail')
        mockMailer.setFail(false)
      })

      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/emaillist',
        json: true,
        body: {url: '/testpost'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(resp.statusCode, 202, 'accepted but not fully working')
        t.equal(body.message.failedSends[0], 'test@example.com', 'failed sending')
        conn.query = oldConn
        t.end()
      })
    })

    test('bad mime-type', function (t) {
      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/emaillist',
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
        url: 'http://127.0.0.1:3000/emaillist',
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

test('emaillist user bad mysql query', function (t) {
  testSetup('mysqlQueryFail', router, function (err, conn, server) {
    t.error(err, 'mysql connected')
    server.listen(3000)

    test('unable to insert', function (t) {
      const opts = {
        method: 'POST',
        url: 'http://127.0.0.1:3000/emaillist',
        json: true,
        body: {email: 'test@example.com'}
      }

      request(opts, function (err, resp, body) {
        t.error(err, 'request sent')
        t.equal(body.message, 'Unable to obtain list of email addresses', 'got failure')
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
