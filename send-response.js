'use strict'

module.exports = function sendResponse (res, statusCode, message, headers) {
  headers = headers || {}

  const reply = JSON.stringify({message, statusCode})
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Content-Length': reply.length
  }
  const resHeaders = Object.assign(defaultHeaders, headers)
  res.writeHead(statusCode, resHeaders)
  return res.end(reply)
}
