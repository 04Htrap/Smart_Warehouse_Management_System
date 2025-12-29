const express = require('express');
const router = express.Router();
const routesController = require('../controllers/routes.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
  '/optimize/from-orders',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  routesController.optimizeFromOrders
);

module.exports = router;
