'use strict'

const bunyan = require('bunyan')
const config = require('./config')

function reqSerializer (req) {
  return {
    method: req.method,
    url: req.url,
    'user-agent': req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
  }
}

const log = function (override) {
  return bunyan.createLogger({
    name: 'signup',
    serializers: {
      err: bunyan.stdSerializers.err,
      req: reqSerializer
    },
    streams: [
      {
        level: process.env.LOG_LEVEL || config.log.level || 'info',
        stream: override || config.log.stream || process.stdout
      }
    ]
  })
}

module.exports = log
