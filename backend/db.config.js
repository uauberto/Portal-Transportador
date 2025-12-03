const { Pool } = require('pg');

// --- IMPORTANTE ---
// Substitua os detalhes abaixo pela configuração do seu banco de dados PostgreSQL.
// Recomenda-se o uso de variáveis de ambiente para estas configurações em produção.
const pool = new Pool({
  user: 'postgres',         // Seu usuário do PostgreSQL
  host: 'localhost',        // Host do banco de dados
  database: 'nfe_portal',   // Nome do banco de dados que você criou
  password: 'your_password', // Sua senha do PostgreSQL
  port: 5432,               // Porta padrão do PostgreSQL
});

pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
