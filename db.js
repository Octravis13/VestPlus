const mysql = require("mysql2/promise")

const {
  MYSQLUSER,
  MYSQL_ROOT_PASSWORD,
  RAILWAY_PRIVATE_DOMAIN,
  MYSQL_DATABASE,
} = process.env

if (!MYSQLUSER || !MYSQL_ROOT_PASSWORD || !MYSQL_DATABASE) {
  throw new Error("❌ Variáveis MySQL incompletas")
}

const MYSQL_URL = `mysql://${MYSQLUSER}:${MYSQL_ROOT_PASSWORD}@${RAILWAY_PRIVATE_DOMAIN}:3306/${MYSQL_DATABASE}`

const pool = mysql.createPool(MYSQL_URL)

module.exports = pool
