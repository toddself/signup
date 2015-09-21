'use strict'

const log = require('./log')()
const sendResponse = require('./send-response')

module.exports = function verify (req, res, urlInfo, conn) {
  if (!urlInfo.query || !urlInfo.query.hash) {
    return sendResponse(res, 400, 'Missing hash')
  }

  const ip = conn.escape(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  const hash = conn.escape(decodeURIComponent(urlInfo.query.hash))
  const query = `UPDATE users SET verified="t" WHERE hash = '${hash}'`
  log.info(`Making query: ${query}`)
  conn.query(query, function (err) {
    if (err) {
      log.fatal('Unable to verify user', {err: err, ip: ip})
      return sendResponse(res, 500, 'Unable to verify user')
    }
    log.info(`Verified users`, {hash: hash, ip: ip})
    sendResponse(res, 200, 'Thank you for verifying your address')
  })
}
