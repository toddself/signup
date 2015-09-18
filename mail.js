'use strict'

const mailer = require('nodemailer')

const config = require('./config')

let transportConfiguration
if (config.email.transportName) {
  let transport = require(config.email.transportName)
  transportConfiguration = transport(config.email.transportConfig)
} else {
  transportConfiguration = config.email.transportConfig
}

const transporter = mailer.createTransport(transportConfiguration)

module.exports = transporter
