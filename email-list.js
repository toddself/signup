'use strict'

const sendMail = require('./send-mail')
const log = require('./log')
const sendResponse = require('./send-response')

module.exports = function send (req, res, urlInfo, conn) {
  if (req.headers['content-type'] !== 'application/json') {
    return sendResponse(res, 400, 'Expected application/json')
  }

  const body = []
  req.on('data', function (data) {
    body.push(data.toString('utf8'))
  })

  req.on('end', function () {
    let payload
    try {
      payload = JSON.parse(body.join(''))
    } catch (err) {
      log.fatal('Unable to decode JSON payload for send', {err: err, body: body})
      return sendResponse(res, 400, `Sorry ${body.join('')} is not a valid request`)
    }

    conn.query('SELECT email, hash FROM users WHERE verified = "t"', function (err, resp) {
      if (err) {
        log.fatal('Unable to get users from database', {err: err})
        return sendResponse(res, 500, 'Unable to obtain list of email addresses')
      }

      const errors = []
      let complete = 0

      function done (err) {
        ++complete
        if (err) {
          errors.push(err.email)
        }

        if (complete === resp.length) {
          if (errors.length) {
            log.warn('Unable to send email to all recpients', {failed: errors})
            return sendResponse(res, 202, {failedSends: errors})
          }
          log.info('Sent email to all recipients')
          return sendResponse(res, 200, 'success')
        }
      }

      resp.forEach((row) => sendMail(row, payload, done))
    })
  })
}
