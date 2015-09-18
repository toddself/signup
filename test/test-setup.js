'use strict'

const url = require('url')
const http = require('http')
const mysql = require('mysql')
const connectDB = require('../connect-db')

const mocks = {
  mysqlSuccess: () => {
    return {
      connect: (cb) => cb(),
      query: (string, cb) => cb(),
      escape: (x) => x
    }
  },
  mysqlConnectFail: () => {
    return {
      connect: (cb) => cb(new Error('failure')),
      escape: (x) => x
    }
  },
  mysqlQueryFail: () => {
    return {
      connect: (cb) => cb(),
      query: (string, cb) => cb(new Error('failure')),
      escape: (x) => x
    }
  }
}

module.exports = function setup (mysqlMock, router, cb) {
  if (mocks[mysqlMock]) {
    mysql.createConnection = mocks[mysqlMock]
  }

  connectDB(function (err, conn) {
    const server = http.createServer(function (req, res) {
      const urlInfo = url.parse(req.url, true)
      router[req.method][urlInfo.pathname].call(router, req, res, urlInfo, conn)
    })
    cb(err, conn, server)
  })
}
