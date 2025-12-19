const mysql = require("mysql2/promise")

let pool

// Tentar usar MYSQL_URL (URL interna do Railway) primeiro
if (process.env.MYSQL_URL) {
  console.log("[DB] Conectando usando MYSQL_URL (Railway internal)")
  pool = mysql.createPool({
    uri: process.env.MYSQL_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
} else if (process.env.MYSQL_PUBLIC_URL) {
  console.log("[DB] Conectando usando MYSQL_PUBLIC_URL")
  pool = mysql.createPool({
    uri: process.env.MYSQL_PUBLIC_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
} else if (process.env.MYSQL_HOST) {
  // Fallback para variáveis individuais
  console.log("[DB] Conectando usando variáveis individuais")
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
} else {
  console.error("[DB] ERRO: Nenhuma variável de ambiente MySQL encontrada!")
  process.exit(1)
}

// Teste de conexão com retry
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query("SELECT 1")
      console.log("[DB] ✓ MySQL conectado com sucesso!")
      return
    } catch (err) {
      console.error(`[DB] Tentativa ${i + 1}/${retries} falhou:`, err.message)
      if (i < retries - 1) {
        console.log("[DB] Aguardando 2 segundos antes de tentar novamente...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }
  console.error("[DB] ERRO: Não foi possível conectar ao MySQL após várias tentativas")
}

testConnection()

module.exports = pool
