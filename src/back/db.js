const mysql = require("mysql2")

const pool = mysql.createPool({
  host: "localhost",
  user: "vest_app",
  password: "",
  database: "vest_plus_db"
})

module.exports = pool.promise()