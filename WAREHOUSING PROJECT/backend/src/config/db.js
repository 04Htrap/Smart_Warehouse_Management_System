const { Pool } = require('pg');

if (process.env.NODE_ENV === 'test') {
  console.log("Running in TEST mode - Mock DB");

  module.exports = {
    query: async () => ({ rows: [] })
  };

} else {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  module.exports = pool;
}
