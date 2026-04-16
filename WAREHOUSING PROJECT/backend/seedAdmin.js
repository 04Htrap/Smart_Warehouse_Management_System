const pool = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  try {
    // 🔥 check if table exists first
    const tableCheck = await pool.query(`
      SELECT to_regclass('parth_schema.users');
    `);

    if (!tableCheck.rows[0].to_regclass) {
      console.log("⏳ Users table not ready, skipping seeding...");
      return;
    }

    const existing = await pool.query(
      "SELECT * FROM parth_schema.users WHERE email = $1",
      [email]
    );

    if (existing.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        `INSERT INTO parth_schema.users (name, email, password, role)
         VALUES ($1, $2, $3, $4)`,
        ["Admin", email, hashedPassword, "ADMIN"]
      );

      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
  }
}

module.exports = seedAdmin;