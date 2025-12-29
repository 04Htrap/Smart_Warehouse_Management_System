const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecretkey';

// ===============================
// REGISTER (DEFAULT ROLE: ORDER_CREATOR)
// ===============================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'ORDER_CREATOR')
       RETURNING id, role`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user_id: result.rows[0].id,
      role: result.rows[0].role
    });

  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ===============================
// LOGIN
// ===============================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND is_active = true`,
    [email]
  );

  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];
  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { user_id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    role: user.role
  });
};
