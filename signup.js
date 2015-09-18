'use strict'

const http = require('http')

const connectDB = require('./connect-db')
const config = require('./config')
const log = require('./log')
const router = require('./router')

function runServer (cb) {
  const port = process.env.PORT || config.http.port || 3456
  const ip = process.env.IP || config.http.ip || '127.0.0.1'

  connectDB(function (err, conn) {
    if (err) {
      log.fatal('unable to start app', {err: err})
      return cb(err)
    }

    const server = http.createServer(function (req, res) {
      router(req, res, conn)
    })

    server.listen(port, ip, function () {
      log.info(`listening on ${ip}:${port}`)
      cb(null, conn, server)
    })
  })
}

if (!module.parent) {
  runServer((err) => err && process.exit(1))
}

module.exports = runServer
