// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

// module.exports = pool;

// const { Pool } = require('pg');

// const pool = new Pool({
//   host: 'localhost',
//   port: 5432,
//   user: 'parth',
//   password: 'parth123',
//   database: 'warehouse_db',
//   options: '-c search_path=parth_schema'
// });

// module.exports = pool;

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'warehouse_db',
  options: '-c search_path=parth_schema'
});

module.exports = pool;