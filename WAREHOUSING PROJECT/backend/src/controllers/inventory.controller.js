const pool = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const query = `
      SELECT 
        i.product_name,
        i.quantity,
        i.warehouse_id,
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

// ===============================
// RESTOCK INVENTORY
// Add quantity to existing inventory
// Creates product in products table if it doesn't exist
// ===============================
exports.restockInventory = async (req, res) => {
  const { product_name, warehouse_id, quantity } = req.body;

  if (!product_name || !warehouse_id || quantity === undefined || quantity <= 0) {
    return res.status(400).json({ 
      error: 'product_name, warehouse_id, and quantity (positive number) are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure product exists in products table (insert if it doesn't exist)
    await client.query(
      `INSERT INTO products (product_name) 
       VALUES ($1) 
       ON CONFLICT (product_name) DO NOTHING`,
      [product_name]
    );

    // Check if inventory record exists
    const checkResult = await client.query(
      `SELECT quantity FROM inventory 
       WHERE product_name = $1 AND warehouse_id = $2`,
      [product_name, warehouse_id]
    );

    if (checkResult.rowCount === 0) {
      // Create new inventory record if it doesn't exist
      await client.query(
        `INSERT INTO inventory (product_name, warehouse_id, quantity)
         VALUES ($1, $2, $3)`,
        [product_name, warehouse_id, quantity]
      );

      await client.query('COMMIT');

      return res.json({
        message: 'Inventory record created and restocked successfully',
        product_name,
        warehouse_id,
        new_quantity: quantity
      });
    }

    // Update existing inventory
    const updateResult = await client.query(
      `UPDATE inventory 
       SET quantity = quantity + $1 
       WHERE product_name = $2 AND warehouse_id = $3
       RETURNING quantity`,
      [quantity, product_name, warehouse_id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Inventory restocked successfully',
      product_name,
      warehouse_id,
      quantity_added: quantity,
      new_quantity: updateResult.rows[0].quantity
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

