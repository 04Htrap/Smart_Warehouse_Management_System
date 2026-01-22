const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, locationsController.getLocations);

module.exports = router;
