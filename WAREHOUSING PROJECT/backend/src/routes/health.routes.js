const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_schema()');
    res.json({
      status: 'DB OK',
      schema: result.rows[0].current_schema
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
