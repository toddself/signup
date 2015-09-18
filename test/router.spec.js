'use strict'

const http = require('http')

const request = require('request')
const test = require('tap').test
const proxyquire = require('proxyquire')

const router = proxyquire('../router', {
  './addUser': responder,
  './removeUser': responder,
  './emailList': responder,
  './verifyUser': responder
})
const sendResponse = require('../send-response')

function responder (req, res, urlInfo) {
  sendResponse(res, 200, 'ok')
}

const server = http.createServer(router)
server.listen(3000)

test('router responds to add', function (t) {
  const opts = {
    url: 'http://localhost:3000/signup/adduser',
    method: 'POST',
    json: true,
    body: {email: 'test@example.com'}
  }

  request(opts, function (err, resp, body) {
    t.error(err, 'request sent')
    t.equal(resp.statusCode, 200, 'ok')
    t.end()
  })
})

test('router responds to verify', function (t) {
  const opts = {
    url: 'http://localhost:3000/signup/verify',
    method: 'GET'
  }

  request(opts, function (err, resp, body) {
    t.error(err, 'request sent')
    t.equal(resp.statusCode, 200, 'ok')
    t.end()
  })
})

test('router responds to emaillist', function (t) {
  const opts = {
    url: 'http://localhost:3000/signup/emaillist',
    method: 'POST',
    json: true,
    body: {url: '/testpost'}
  }

  request(opts, function (err, resp, body) {
    t.error(err, 'request sent')
    t.equal(resp.statusCode, 200, 'ok')
    t.end()
  })
})

test('router responds to remove', function (t) {
  const opts = {
    url: 'http://localhost:3000/signup/removeuser',
    method: 'DELETE'
  }

  request(opts, function (err, resp, body) {
    t.error(err, 'request sent')
    t.equal(resp.statusCode, 200, 'ok')
    t.end()
  })
})

test('router sends 404', function (t) {
  request.get('http://localhost:3000/whatthe', function (err, resp, body) {
    t.error(err, 'request sent')
    t.equal(resp.statusCode, 404, 'got 404')
    t.end()
  })
})

test('teardown', function (t) {
  server.close()
  t.end()
})
