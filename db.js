const mysql = require("mysql2/promise")

let pool

async function ensureDatabaseExists() {
  let tempPool

  try {
    if (process.env.MYSQL_DATABASE && process.env.MYSQL_ROOT_PASSWORD) {
      console.log("[DB] Verificando se banco de dados existe...")

      // Conectar SEM especificar database
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

      // Criar banco de dados se não existir
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
  await ensureDatabaseExists()

  if (process.env.MYSQL_DATABASE && process.env.MYSQL_ROOT_PASSWORD) {
    console.log("[DB] Conectando usando variáveis do Railway MySQL")

    const dbConfig = {
      host: process.env.MYSQL_URL ? new URL(process.env.MYSQL_URL).hostname : "mysql-1j98.railway.internal",
      user: "root",
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    }

    pool = mysql.createPool(dbConfig)

    console.log(`[DB] Host: ${dbConfig.host}`)
    console.log(`[DB] Port: ${dbConfig.port}`)
    console.log(`[DB] Database: ${dbConfig.database}`)
    console.log(`[DB] User: ${dbConfig.user}`)
  } else if (process.env.MYSQL_URL) {
    console.log("[DB] Conectando usando MYSQL_URL")

    const url = new URL(process.env.MYSQL_URL)

    pool = mysql.createPool({
      host: url.hostname,
      user: url.username || "root", // fallback para root se username estiver vazio
      password: url.password,
      database: url.pathname.substring(1),
      port: url.port || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    console.log(`[DB] Host: ${url.hostname}`)
    console.log(`[DB] Port: ${url.port || 3306}`)
    console.log(`[DB] Database: ${url.pathname.substring(1)}`)
    console.log(`[DB] User: ${url.username || "root"}`)
  } else if (process.env.MYSQL_HOST) {
    console.log("[DB] Conectando usando variáveis individuais")

    if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      console.error("[DB] ERRO: Variáveis MYSQL_USER, MYSQL_PASSWORD e MYSQL_DATABASE são obrigatórias!")
      process.exit(1)
    }

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  } else {
    console.error("[DB] ERRO: Nenhuma variável de ambiente MySQL encontrada!")
    console.error("[DB] Configure uma das opções:")
    console.error("[DB] - MYSQL_DATABASE e MYSQL_ROOT_PASSWORD (Railway)")
    console.error("[DB] - MYSQL_URL")
    console.error("[DB] - MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE")
    process.exit(1)
  }
}

async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[DB] Tentando conectar... (${i + 1}/${retries})`)
      const connection = await pool.getConnection()
      await connection.query("SELECT 1")
      connection.release()
      console.log("[DB] ✓ MySQL conectado com sucesso!")
      return true
    } catch (err) {
      console.error(`[DB] Tentativa ${i + 1}/${retries} falhou:`)
      console.error(`[DB] Erro: ${err.message}`)
      console.error(`[DB] Código: ${err.code}`)

      if (err.code === "ER_ACCESS_DENIED_ERROR") {
        console.error("[DB] DICA: Verifique se o usuário e senha estão corretos nas variáveis de ambiente")
        console.error("[DB] DICA: No Railway, use a variável MYSQL_URL fornecida pelo serviço MySQL")
      }

      if (i < retries - 1) {
        console.log("[DB] Aguardando 2 segundos antes de tentar novamente...")
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }
  console.error("[DB] ERRO: Não foi possível conectar ao MySQL após várias tentativas")
  return false
}

initializePool()
  .then(() => testConnection())
  .catch((err) => {
    console.error("[DB] Erro fatal na inicialização:", err)
    process.exit(1)
  })

module.exports = pool
