import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button, Badge, Modal } from 'react-bootstrap';
import api from '../../api/axios';
import Layout from '../../components/Layout';

function ManagerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const [showOptimized, setShowOptimized] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const status = showOptimized ? 'OPTIMIZED' : 'CREATED';
      const res = await api.get(`/orders?status=${status}`);
      console.log('Fetched manager orders:', res.data);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching manager orders:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [showOptimized]);

  const handleOptimize = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/optimize`);
      setError('');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to optimize order');
    }
  };

  const handleDispatch = async () => {
    if (!selectedOrder) return;

    try {
      await api.post(`/orders/${selectedOrder.id}/dispatch`);
      setError('');
      setShowDispatchModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch order');
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
            <h2>Manager Orders</h2>
            <div>
              <Button
                variant={!showOptimized ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setShowOptimized(false)}
              >
                CREATED
              </Button>
              <Button
                variant={showOptimized ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setShowOptimized(true)}
              >
                OPTIMIZED
              </Button>
              <Button variant="secondary" onClick={fetchOrders} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
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
              <h5>{showOptimized ? 'Optimized Orders (Status: OPTIMIZED)' : 'Pending Orders (Status: CREATED)'}</h5>
            </Card.Header>
            <Card.Body>
              {loading && orders.length === 0 ? (
                <div className="text-center p-4">Loading orders...</div>
              ) : orders.length === 0 ? (
                <Alert variant="info">
                  {showOptimized 
                    ? 'No optimized orders found. Optimize some orders first.' 
                    : 'No pending orders found. All orders have been processed.'}
                </Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Delivery City</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Actions</th>
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
                        <td>
                          {order.status === 'CREATED' && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleOptimize(order.id)}
                              className="me-2"
                            >
                              Optimize
                            </Button>
                          )}
                          {order.status === 'OPTIMIZED' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDispatchModal(true);
                              }}
                            >
                              Dispatch
                            </Button>
                          )}
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

      {/* Dispatch Confirmation Modal */}
      <Modal show={showDispatchModal} onHide={() => setShowDispatchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Dispatch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to dispatch Order #{selectedOrder?.id}?</p>
          <p className="text-muted">
            This will reduce inventory levels and mark the order as DISPATCHED.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDispatchModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleDispatch}>
            Confirm Dispatch
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
}

export default ManagerOrders;

