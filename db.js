const mysql = require("mysql2/promise");

console.log('[DB] Criando pool de conexões...');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Teste imediato de conexão
pool.query('SELECT 1')
  .then(() => console.log('[DB] MySQL conectado com sucesso!'))
  .catch(err => {
    console.error('[DB] ERRO ao conectar MySQL:');
    console.error('Código:', err.code);
    console.error('Mensagem:', err.message);
    console.error('Erro completo:', err);
  });

module.exports = pool;