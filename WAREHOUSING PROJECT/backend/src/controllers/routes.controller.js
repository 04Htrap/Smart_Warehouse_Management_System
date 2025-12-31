const pool = require('../config/db');
const haversineDistance = require('../utils/distance');

exports.optimizeFromOrders = async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `SELECT id, delivery_city
       FROM orders
       WHERE status = 'OPTIMIZED'
       AND warehouse_id = 1`
    );

    if (ordersResult.rowCount === 0) {
      return res.json({ message: 'No pending orders to optimize' });
    }

    // Group orders by city
    const cityOrdersMap = {};
    for (const row of ordersResult.rows) {
      const city = row.delivery_city.trim().toLowerCase();
      if (!cityOrdersMap[city]) cityOrdersMap[city] = [];
      cityOrdersMap[city].push(row.id);
    }

    const cities = Object.keys(cityOrdersMap);

    const warehouseResult = await pool.query(
      `SELECT l.latitude, l.longitude
       FROM warehouses w
       JOIN locations l ON w.location_id = l.id
       WHERE w.id = 1`
    );

    const start = warehouseResult.rows[0];

    const citiesResult = await pool.query(
      `SELECT name, latitude, longitude
       FROM locations
       WHERE LOWER(name) = ANY($1::text[])`,
      [cities]
    );

    let remaining = citiesResult.rows;
    let current = start;
    let route = [];
    let totalDistance = 0;

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = haversineDistance(
          current.latitude,
          current.longitude,
          remaining[i].latitude,
          remaining[i].longitude
        );

        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = i;
        }
      }

      const cityName = remaining[nearestIndex].name;
      totalDistance += nearestDistance;

      route.push({
        city: cityName,
        orders: cityOrdersMap[cityName.toLowerCase()],
        distance_from_previous_km: nearestDistance.toFixed(2)
      });

      current = remaining[nearestIndex];
      remaining.splice(nearestIndex, 1);
    }

    res.json({
      strategy: 'Nearest Neighbor',
      total_distance_km: totalDistance.toFixed(2),
      route
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
