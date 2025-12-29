const pool = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.product_name,
        i.quantity,
        w.name AS warehouse_name
      FROM inventory i
      JOIN warehouses w ON i.warehouse_id = w.id
      ORDER BY i.product_name;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryForecast = async (req, res) => {
  try {
    const result = await pool.query(`
      WITH recent_sales AS (
        SELECT
          product_name,
          quantity_sold,
          ROW_NUMBER() OVER (
            PARTITION BY product_name
            ORDER BY date DESC
          ) AS rn
        FROM sales_records
      ),
      moving_avg AS (
        SELECT
          product_name,
          AVG(quantity_sold) AS predicted_demand
        FROM recent_sales
        WHERE rn <= 5
        GROUP BY product_name
      )
      SELECT
        i.product_name,
        i.quantity AS current_inventory,
        ROUND(ma.predicted_demand) AS predicted_demand,
        GREATEST(0, ROUND(ma.predicted_demand) - i.quantity) AS recommended_restock
      FROM inventory i
      JOIN moving_avg ma
        ON i.product_name = ma.product_name
      ORDER BY recommended_restock DESC
    `);

    res.json({
      strategy: 'Event-based Moving Average (last 5 sales)',
      data: result.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

