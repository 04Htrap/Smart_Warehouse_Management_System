const pool = require('../config/db');

//Gets all delivery location for order creation dropdown.
exports.getLocations = async (req, res) => {
  try {
    const query = `
      SELECT id, name, latitude, longitude
      FROM locations
      ORDER BY name;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
