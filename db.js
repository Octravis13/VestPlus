const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
})

const pool = require('./db');

// Teste de conexão
pool.query('SELECT 1')
  .then(() => console.log('MySQL conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar MySQL:', err));