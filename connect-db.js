'use strict'

const mysql = require('mysql')
const config = require('./config')

module.exports = function connect (cb) {
  const conn = mysql.createConnection({
    host: process.env.MYSQL_HOST || config.mysql.host || '127.0.0.1',
    port: process.env.MYSQL_PORT || config.mysql.port || 3306,
    user: process.env.MYSQL_USER || config.mysql.user,
    password: process.env.MYSQL_PASS || config.mysql.pass,
    database: process.env.MYSQL_DATABASE || config.mysql.database || 'signup'
  })

  conn.connect((err) => cb(err, conn))
}
