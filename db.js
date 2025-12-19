const mysql = require("mysql2")

let dbConfig

// Configuração do banco
if (process.env.MYSQL_DATABASE && process.env.MYSQL_ROOT_PASSWORD) {
  // Produção (Railway)
  dbConfig = {
    host: process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).hostname : "mysql-1j98.railway.internal",
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
} else {
  // Local
  dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "vest_plus_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
}

console.log("[DB] Conectando usando variáveis do Railway MySQL")
console.log("[DB] Host:", dbConfig.host)
console.log("[DB] Port:", dbConfig.port)
console.log("[DB] Database:", dbConfig.database)
console.log("[DB] User:", dbConfig.user)

const pool = mysql.createPool(dbConfig)

// Testar conexão em background (não bloqueia a exportação)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("[DB] ERRO: Não foi possível conectar ao MySQL após várias tentativas")
    console.error("[DB] Erro:", err.message)
  } else {
    console.log("[DB] ✓ MySQL conectado com sucesso!")
    connection.release()
  }
})

module.exports = pool
