import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button, Badge, Modal, Form } from 'react-bootstrap';
import api from '../../api/axios';
import Layout from '../../components/Layout';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/admin/users/${selectedUser.id}/role`, { role: newRole });
      setSuccess(`User role updated successfully to ${newRole}`);
      setShowRoleModal(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: 'danger',
      WAREHOUSE_MANAGER: 'primary',
      ORDER_CREATOR: 'info'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
  };

  return (
    <Layout>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Admin Dashboard</h2>
            <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row>
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body className="text-center">
              <h3>{users.length}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body className="text-center">
              <h3>{users.filter(u => u.role === 'ADMIN').length}</h3>
              <p className="text-muted mb-0">Admins</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body className="text-center">
              <h3>{users.filter(u => u.is_active).length}</h3>
              <p className="text-muted mb-0">Active Users</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>User Management</h5>
            </Card.Header>
            <Card.Body>
              {loading && users.length === 0 ? (
                <div className="text-center p-4">Loading users...</div>
              ) : users.length === 0 ? (
                <Alert variant="info">No users found.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.is_active)}</td>
                        <td>{new Date(user.created_at).toLocaleString()}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleRoleChange(user)}
                          >
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>User:</strong> {selectedUser.name} ({selectedUser.email})
              </p>
              <p>
                <strong>Current Role:</strong> {selectedUser.role}
              </p>
              <Form.Group className="mt-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="ORDER_CREATOR">ORDER_CREATOR</option>
                  <option value="WAREHOUSE_MANAGER">WAREHOUSE_MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateRole}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default AdminDashboard;

