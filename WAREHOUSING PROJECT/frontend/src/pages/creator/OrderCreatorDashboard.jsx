import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Layout from '../../components/Layout';

function OrderCreatorDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    delivery_city: '',
    warehouse_id: 1,
    items: [{ product_name: '', quantity: '' }]
  });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      console.log('Fetched orders:', res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setLoading(true);

    try {
      const items = createForm.items
        .filter(item => item.product_name && item.quantity)
        .map(item => ({
          product_name: item.product_name,
          quantity: Number(item.quantity)
        }));

      if (items.length === 0) {
        setCreateError('At least one item is required');
        setLoading(false);
        return;
      }

      const res = await api.post('/orders', {
        warehouse_id: createForm.warehouse_id,
        delivery_city: createForm.delivery_city,
        items: items
      });

      setCreateSuccess('Order created successfully!');
      setCreateForm({
        delivery_city: '',
        warehouse_id: 1,
        items: [{ product_name: '', quantity: '' }]
      });

      // Refresh orders list
      setTimeout(() => {
        setShowCreateModal(false);
        fetchOrders();
      }, 1500);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const addItemRow = () => {
    setCreateForm({
      ...createForm,
      items: [...createForm.items, { product_name: '', quantity: '' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...createForm.items];
    newItems[index][field] = value;
    setCreateForm({ ...createForm, items: newItems });
  };

  const removeItemRow = (index) => {
    if (createForm.items.length > 1) {
      const newItems = createForm.items.filter((_, i) => i !== index);
      setCreateForm({ ...createForm, items: newItems });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      CREATED: 'warning',
      OPTIMIZED: 'info',
      DISPATCHED: 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Layout>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Order Creator Dashboard</h2>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create New Order
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

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>My Orders</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">Loading orders...</div>
              ) : orders.length === 0 ? (
                <Alert variant="info">
                  No orders found. Create your first order to get started.
                </Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Delivery City</th>
                        <th>Items</th>
                        <th>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.delivery_city}</td>
                        <td>
                          {order.items && order.items.length > 0 ? (
                            <ul className="list-unstyled mb-0">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="small">
                                  {item.product_name}: {item.quantity}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted">No items</span>
                          )}
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Create Order Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Order</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateOrder}>
          <Modal.Body>
            {createError && <Alert variant="danger">{createError}</Alert>}
            {createSuccess && <Alert variant="success">{createSuccess}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Delivery City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter delivery city"
                value={createForm.delivery_city}
                onChange={(e) => setCreateForm({ ...createForm, delivery_city: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Items</Form.Label>
              {createForm.items.map((item, index) => (
                <Row key={index} className="mb-2">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Product name"
                      value={item.product_name}
                      onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                  </Col>
                  <Col md={3}>
                    {createForm.items.length > 1 && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItemRow(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
              <Button variant="outline-secondary" size="sm" onClick={addItemRow}>
                Add Item
              </Button>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}

export default OrderCreatorDashboard;

