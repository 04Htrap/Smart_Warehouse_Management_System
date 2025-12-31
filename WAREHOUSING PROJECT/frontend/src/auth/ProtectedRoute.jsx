import { Navigate } from 'react-router-dom';
import { getRole, isLoggedIn } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles, children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  const role = getRole();
  if (!allowedRoles.includes(role)) {
    // Redirect to user's default dashboard based on role
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === 'WAREHOUSE_MANAGER') {
      return <Navigate to="/manager/orders" replace />;
    } else if (role === 'ORDER_CREATOR') {
      return <Navigate to="/creator/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
