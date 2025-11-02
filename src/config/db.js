require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:28April2001%4023@127.0.0.1:5432/errorwise';

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production'
    ? { require: true, rejectUnauthorized: false }
    : false
});

// Test the connection
pool.on('connect', () => {
  console.log('PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
