'use strict'

const crypto = require('crypto')

const sendVerification = require('./send-verification')
const log = require('./log')()
const config = require('./config')
const sendResponse = require('./send-response')

module.exports = function addUser (req, res, urlInfo, conn) {
  if (req.headers['content-type'] !== 'application/json') {
    return sendResponse(res, 400, 'Expected application/json')
  }

  const ip = conn.escape(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  const postBody = []
  req.on('data', function (data) {
    postBody.push(data.toString('utf8'))
  })

  req.on('end', function () {
    let content
    try {
      content = JSON.parse(postBody.join(''))
    } catch (err) {
      log.fatal('Unable to decode addUser payload', {err: err, body: postBody})
      return sendResponse(res, 400, `Sorry ${postBody.join('')} is not a valid request`)
    }

    const email = content.email
    if (!/.+@.+\..+/.test(email)) {
      return sendResponse(res, 400, `${email} is not a valid email address`)
    }

    const hashText = `${email}:${config.security.hash}:${(new Date()).getTime()}`
    const hash = crypto.createHash('sha1').update(hashText).digest('hex')
    const query = `INSERT INTO users (email, hash, ip, verified) VALUES (${conn.escape(email)}, "${hash}", ${ip}, "f")`
    log.info(`Making query ${query}`)
    conn.query(query, function (err) {
      if (err) {
        log.warn('Unable to add user to table', {err: err, ip: ip})
        return sendResponse(res, 500, 'An error occurred updating list')
      }
      log.info(`Added ${email} to mailing list from`, {email: email, hash: hash, ip: ip})
      sendVerification(email, hash, function (err) {
        if (err) {
          return sendResponse(res, 500, `Unable to add ${email} to list`)
        }
        sendResponse(res, 201, 'success')
      })
    })
  })
}
