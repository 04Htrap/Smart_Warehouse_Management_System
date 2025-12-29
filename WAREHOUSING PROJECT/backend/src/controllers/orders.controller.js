const pool = require('../config/db');

// ===============================
// CREATE ORDER (STATUS: CREATED)
// Inventory is NOT reduced here
// ===============================
exports.createOrder = async (req, res) => {
  const { warehouse_id, delivery_city, items } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!delivery_city) {
      throw new Error('delivery_city is required');
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (warehouse_id, delivery_city, status)
       VALUES ($1, $2, 'CREATED')
       RETURNING id`,
      [warehouse_id, delivery_city]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items (NO inventory reduction)
    for (const item of items) {
      const { product_name, quantity } = item;

      // Optional: check inventory availability (do NOT reduce)
      const stockCheck = await client.query(
        `SELECT quantity FROM inventory
         WHERE product_name = $1 AND warehouse_id = $2`,
        [product_name, warehouse_id]
      );

      if (
        stockCheck.rowCount === 0 ||
        stockCheck.rows[0].quantity < quantity
      ) {
        throw new Error(`Insufficient stock for ${product_name}`);
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_name, quantity)
         VALUES ($1, $2, $3)`,
        [orderId, product_name, quantity]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Order created successfully',
      order_id: orderId,
      status: 'CREATED'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

// ==================================
// MARK ORDER AS OPTIMIZED (MANAGER)
// ==================================
exports.markOptimized = async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE orders
     SET status = 'OPTIMIZED'
     WHERE id = $1 AND status = 'CREATED'
     RETURNING id`,
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      error: 'Order not found or not in CREATED state'
    });
  }

  res.json({
    message: 'Order marked as OPTIMIZED',
    order_id: id
  });
};

// ==================================
// DISPATCH ORDER (INVENTORY REDUCTION)
// ==================================
exports.dispatchOrder = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fetch items only if order is OPTIMIZED
    const itemsResult = await client.query(
      `SELECT oi.product_name, oi.quantity, o.warehouse_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.id = $1 AND o.status = 'OPTIMIZED'`,
      [id]
    );

    if (itemsResult.rowCount === 0) {
      throw new Error('Order not in OPTIMIZED state');
    }

    // Reduce inventory
    for (const item of itemsResult.rows) {
      const stockResult = await client.query(
        `SELECT quantity FROM inventory
         WHERE product_name = $1 AND warehouse_id = $2`,
        [item.product_name, item.warehouse_id]
      );

      if (stockResult.rows[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product_name}`);
      }

      await client.query(
        `UPDATE inventory
         SET quantity = quantity - $1
         WHERE product_name = $2 AND warehouse_id = $3`,
        [item.quantity, item.product_name, item.warehouse_id]
      );
    }

    // Update order status
    await client.query(
      `UPDATE orders
       SET status = 'DISPATCHED'
       WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Order DISPATCHED successfully',
      order_id: id,
      status: 'DISPATCHED'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};
