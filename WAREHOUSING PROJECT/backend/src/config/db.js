const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'parth',
  password: 'parth123',
  database: 'warehouse_db',
  options: '-c search_path=parth_schema'
});

module.exports = pool;
