'use strict'

const url = require('url')
const transporter = require('./mail')
const config = require('./config')
const log = require('./log')()

function sendMail (row, payload, cb) {
  const siteUrl = url.format({
    protocol: 'http:',
    host: config.http.hostname,
    pathname: payload.url || ''
  })

  const optOutUrl = url.format({
    protocol: 'http:',
    host: config.http.hostname,
    pathname: '/signup/removeuser',
    search: `hash=${encodeURIComponent(row.hash)}`
  })

  const mailOpts = {
    from: `${config.email.name} <${config.email.address}>`,
    subject: `A new post has been made in ${config.http.display}`,
    to: row.email,
    text: `A new post has been made to ${config.http.display}!\nRead by going to ${siteUrl}\n\nTo unsubscribe: ${optOutUrl}`,
    html: `<p>A new post has been made to <a href="${siteUrl}">${config.http.display}</a>!
           <p>Read by going to <a href="${siteUrl}">${siteUrl}</a>
           <p><a href="{$optOutUrl}">Click here to unsubscribe</a> or visit ${optOutUrl} in your browser.`
  }

  transporter.sendMail(mailOpts, function (err, info) {
    if (err) {
      err.email = row.email
      log.fatal('Unable to send email', {err: err, info: info})
      return cb(err)
    }
    log.info('Email sent', {info: info, options: mailOpts})
    return cb()
  })
}

module.exports = sendMail
