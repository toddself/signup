'use strict'

const sendResponse = require('./send-response')
const log = require('./log')()
const config = require('./config')

module.exports = function removeUser (req, res, urlInfo, conn) {
  if (!urlInfo.query || !urlInfo.query.hash) {
    return sendResponse(res, 400, 'Missing hash in URL')
  }

  const ip = conn.escape(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  const hash = conn.escape(decodeURIComponent(urlInfo.query.hash))
  const query = `DELETE FROM users WHERE hash = ${hash}`
  conn.query(query, function (err) {
    if (err) {
      log.fatal('Unable to remove user', {hash: hash, ip: ip})
      return sendResponse(res, 500, `Unable to remove user, please email ${config.email.address}`)
    }
    sendResponse(res, 200, 'You have been removed from the list')
  })
}
