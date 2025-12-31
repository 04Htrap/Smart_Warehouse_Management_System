import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRole, logout } from '../utils/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRole();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = role === 'ADMIN';
  const isManager = role === 'WAREHOUSE_MANAGER' || isAdmin;
  const isCreator = role === 'ORDER_CREATOR' || isAdmin;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="dashboard-container">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container fluid>
          <Navbar.Brand style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Smart Warehouse Management
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isCreator && (
                <Nav.Link
                  active={isActive('/creator/dashboard')}
                  onClick={() => navigate('/creator/dashboard')}
                >
                  Order Creator Dashboard
                </Nav.Link>
              )}
              {isManager && (
                <>
                  <Nav.Link
                    active={isActive('/manager/orders')}
                    onClick={() => navigate('/manager/orders')}
                  >
                    Manager Orders
                  </Nav.Link>
                  <Nav.Link
                    active={isActive('/manager/route-optimization')}
                    onClick={() => navigate('/manager/route-optimization')}
                  >
                    Route Optimization
                  </Nav.Link>
                  <Nav.Link
                    active={isActive('/manager/inventory-forecast')}
                    onClick={() => navigate('/manager/inventory-forecast')}
                  >
                    Inventory & Forecast
                  </Nav.Link>
                  <Nav.Link
                    active={isActive('/manager/restock')}
                    onClick={() => navigate('/manager/restock')}
                  >
                    Restock
                  </Nav.Link>
                </>
              )}
              {isAdmin && (
                <Nav.Link
                  active={isActive('/admin/dashboard')}
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Admin Dashboard
                </Nav.Link>
              )}
            </Nav>
            <Nav>
              <NavDropdown title={role || 'User'} id="user-nav-dropdown">
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="page-container">
        {children}
      </Container>
    </div>
  );
};

export default Layout;

