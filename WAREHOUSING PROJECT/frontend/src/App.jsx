import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn, getRole } from './utils/auth';

import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './auth/ProtectedRoute';

import OrderCreatorDashboard from './pages/creator/OrderCreatorDashboard';
import CreateOrder from './pages/creator/CreateOrder';
import ManagerOrders from './pages/manager/ManagerOrders';
import RouteOptimization from './pages/manager/RouteOptimization';
import InventoryForecast from './pages/manager/InventoryForecast';
import Restock from './pages/manager/Restock';
import AdminDashboard from './pages/admin/AdminDashboard';

function HomeRedirect() {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRole();
  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'WAREHOUSE_MANAGER') {
    return <Navigate to="/manager/orders" replace />;
  } else {
    return <Navigate to="/creator/dashboard" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<HomeRedirect />} />

        {/* Order Creator Routes */}
        <Route
          path="/creator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ORDER_CREATOR', 'ADMIN']}>
              <OrderCreatorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-order"
          element={
            <ProtectedRoute allowedRoles={['ORDER_CREATOR', 'ADMIN']}>
              <CreateOrder />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager/orders"
          element={
            <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
              <ManagerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/route-optimization"
          element={
            <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
              <RouteOptimization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/inventory-forecast"
          element={
            <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
              <InventoryForecast />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/restock"
          element={
            <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
              <Restock />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
