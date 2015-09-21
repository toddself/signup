'use strict'

const test = require('tap').test
const mockMailer = require('mockmailer')

const config = require('../config')

config.email = {
  transportConfig: {
    service: 'Gmail',
    auth: {
      user: 'testing@gmail.com',
      pass: 'thisisntarealaccount'
    }
  }
}

const mail = require('../mail')

test('alternate configuration', function (t) {
  mockMailer(function (err, message) {
    t.error(err, 'sent mail')
    t.ok(message, 'configured')
    t.end()
  })

  const mailOpts = {
    from: 'testing@gmail.com',
    subject: 'test',
    to: 'testing@gmail.com',
    text: 'test',
    html: 'test'
  }
  mail.sendMail(mailOpts)
})
