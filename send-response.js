'use strict'

module.exports = function sendResponse (res, statusCode, message) {
  const reply = JSON.stringify({message, statusCode})
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': reply.length
  })
  return res.end(reply)
}
