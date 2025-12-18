const mysql = require("mysql2/promise")

// Usar URL completa se disponível (mais simples e confiável)
if (process.env.MYSQL_PUBLIC_URL) {
  console.log("[DB] Conectando usando MYSQL_PUBLIC_URL")
  const pool = mysql.createPool(process.env.MYSQL_PUBLIC_URL)

  // Teste de conexão
  pool
    .query("SELECT 1")
    .then(() => console.log("[DB] MySQL conectado com sucesso!"))
    .catch((err) => {
      console.error("[DB] ERRO ao conectar MySQL:", err.message)
    })

  module.exports = pool
} else {
  // Fallback para variáveis individuais
  console.log("[DB] Conectando usando variáveis individuais")
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
  })

  // Teste de conexão
  pool
    .query("SELECT 1")
    .then(() => console.log("[DB] MySQL conectado com sucesso!"))
    .catch((err) => {
      console.error("[DB] ERRO ao conectar MySQL:", err.message)
    })

  module.exports = pool
}
