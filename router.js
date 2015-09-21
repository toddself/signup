'use strict'

const url = require('url')
const addUser = require('./add-user')
const removeUser = require('./remove-user')
const emailList = require('./email-list')
const verifyUser = require('./verify-user')
const sendResponse = require('./send-response')
const log = require('./log')()
let sendForm
if (process.env.NODE_ENV === 'dev') {
  sendForm = require('./send-form')
}

function return404 (req, res) {
  return sendResponse(res, 404, 'Not found')
}

const routingTable = {
  GET: {
    '/signup/verify': verifyUser
  },
  POST: {
    '/signup/adduser': addUser,
    '/signup/emaillist': emailList
  },
  DELETE: {
    '/signup/removeuser': removeUser
  }
}

module.exports = function router (req, res, conn) {
  log.info({req: req})

  if (process.env.NODE_ENV === 'dev') {
    routingTable.GET['/form'] = sendForm
  }

  const urlInfo = url.parse(req.url, true)
  const route = routingTable[req.method][urlInfo.pathname] || return404
  return route(req, res, urlInfo, conn)
}
