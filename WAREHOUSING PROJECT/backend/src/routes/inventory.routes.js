const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get(
  '/',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  inventoryController.getInventory
);

router.get(
  '/forecast',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  inventoryController.getInventoryForecast
);

router.post(
  '/restock',
  authenticate,
  authorize(['WAREHOUSE_MANAGER', 'ADMIN']),
  inventoryController.restockInventory
);

module.exports = router;
