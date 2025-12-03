require('dotenv').config();
const { Pool } = require('pg');

// Usa variáveis de ambiente ou valores padrão para facilitar o setup inicial
const pool = new Pool({
  user: process.env.DB_USER || 'portal_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'portal_transportador',
  password: process.env.DB_PASSWORD || 'orga3000.',
  port: parseInt(process.env.DB_PORT || '5432', 10),
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