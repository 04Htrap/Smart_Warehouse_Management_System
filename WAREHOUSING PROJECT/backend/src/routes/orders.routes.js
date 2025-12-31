const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET all orders - accessible by all authenticated users
router.get(
  '/',
  authenticate,
  ordersController.getAllOrders
);

router.post(
  '/',
  authenticate,
  authorize(['ORDER_CREATOR', 'ADMIN']),
  ordersController.createOrder
);

router.post(
  '/:id/optimize',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  ordersController.markOptimized
);

router.post(
  '/:id/dispatch',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  ordersController.dispatchOrder
);

module.exports = router;
