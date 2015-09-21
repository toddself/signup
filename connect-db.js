'use strict'

const mysql = require('mysql')
const config = require('./config')

module.exports = function connect (cb) {
  const auth = {
    host: process.env.MYSQL_HOST || config.mysql.host || '127.0.0.1',
    port: process.env.MYSQL_PORT || config.mysql.port || 3306,
    user: process.env.MYSQL_USER || config.mysql.user,
    password: typeof process.env.MYSQL_PASS !== 'undefined' ? process.env.MYSQL_PASS : config.mysql.pass,
    database: process.env.MYSQL_DATABASE || config.mysql.database || 'signup'
  }

  if (!auth.user) {
    return new Error('No username was specified for connecting to mysql')
  }

  if (!auth.password) {
    delete auth.password
  }

  const conn = mysql.createConnection(auth)

  conn.connect((err) => cb(err, conn))
}
