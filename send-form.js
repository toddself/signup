'use strict'

const fs = require('fs')
const path = require('path')

module.exports = function sendForm (req, res) {
  return fs.createReadStream(path.join(__dirname, 'client', 'form.html')).pipe(res)
}
