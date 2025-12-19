const mysql = require("mysql2/promise")

let pool
let dbConfig

async function ensureDatabaseExists() {
  let tempPool

  try {
    if (process.env.MYSQL_DATABASE && process.env.MYSQL_ROOT_PASSWORD) {
      console.log("[DB] Verificando se banco de dados existe...")

      const tempConfig = {
        host: process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).hostname : "mysql-1j98.railway.internal",
        user: "root",
        password: process.env.MYSQL_ROOT_PASSWORD,
        port: process.env.MYSQL_PORT || 3306,
        ssl: {
          rejectUnauthorized: false,
        },
      }

      tempPool = mysql.createPool(tempConfig)
      const connection = await tempPool.getConnection()

      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE}\``)
      console.log(`[DB] ✓ Banco de dados '${process.env.MYSQL_DATABASE}' verificado/criado`)

      connection.release()
      await tempPool.end()
    }
  } catch (err) {
    console.error("[DB] Erro ao verificar/criar banco de dados:", err.message)
    if (tempPool) await tempPool.end()
    throw err
  }
}

async function initializePool() {
  if (pool) return pool

  await ensureDatabaseExists()

  if (process.env.MYSQL_DATABASE && process.env.MYSQL_ROOT_PASSWORD) {
    console.log("[DB] Conectando usando variáveis do Railway MySQL")

    const host = process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).hostname : "mysql-1j98.railway.internal"

    dbConfig = {
      host: host,
      user: "root",
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: Number.parseInt(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    }

    console.log(`[DB] Host: ${dbConfig.host}`)
    console.log(`[DB] Port: ${dbConfig.port}`)
    console.log(`[DB] Database: ${dbConfig.database}`)
    console.log(`[DB] User: ${dbConfig.user}`)
  } else {
    // Fallback para desenvolvimento local
    console.log("[DB] Conectando usando config local")

    dbConfig = {
      host: process.env.MYSQL_HOST || "localhost",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "vest_plus_db",
      port: Number.parseInt(process.env.MYSQL_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }
  }

  pool = mysql.createPool(dbConfig)

  pool
    .getConnection()
    .then((connection) => {
      console.log("[DB] ✓ MySQL conectado com sucesso!")
      connection.release()
    })
    .catch((err) => {
      console.error("[DB] Erro ao conectar:", err.message)
      console.error("[DB] Código:", err.code)
    })

  return pool
}

module.exports = initializePool()
