const pool = require('../config/db');

// ===============================
// GET ALL USERS (ADMIN ONLY)
// ===============================
exports.getAllUsers = async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, email, role, is_active, created_at
     FROM users
     ORDER BY created_at`
  );

  res.json(result.rows);
};

// ===============================
// UPDATE USER ROLE (ADMIN ONLY)
// ===============================
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['ORDER_CREATOR', 'WAREHOUSE_MANAGER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const result = await pool.query(
    `UPDATE users
     SET role = $1
     WHERE id = $2
     RETURNING id, role`,
    [role, id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    message: 'User role updated',
    user_id: id,
    new_role: role
  });
};
