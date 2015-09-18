'use strict'

const url = require('url')

const transporter = require('./mail')
const config = require('./config')
const log = require('./log')

module.exports = function sendVerification (email, hash, cb) {
  const verifyUrl = url.format({
    protocol: 'http:',
    host: config.http.hostname,
    pathname: '/signup/verify',
    search: `hash=${encodeURIComponent(hash)}`
  })

  const mailOpts = {
    from: `${config.email.name} <${config.email.address}>`,
    subject: 'Please verify your email address',
    to: email,
    text: `Please cut and paste ${verifyUrl} in your browser to verify your subscription to ${config.http.display}.`,
    html: `<p>Please <a href="${verifyUrl}">verify your subscription</a> to ${config.http.display}.
           <p>If you are unable to click on that link, please cut/paste ${verifyUrl} into your web browser`
  }

  transporter.sendMail(mailOpts, function (err, info) {
    if (err) {
      log.fatal('Unable to send email', {err: err})
      return cb(err)
    }
    log.info('Mail sent', {info: info, options: mailOpts})
    return cb()
  })
}
