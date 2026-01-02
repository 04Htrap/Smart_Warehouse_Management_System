const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const ordersRoutes = require('./routes/orders.routes');
const routeRoutes = require('./routes/routes.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));

app.use('/health', healthRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/orders', ordersRoutes);
app.use('/routes', routeRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

module.exports = app;
