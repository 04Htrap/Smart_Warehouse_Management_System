import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button, Badge, Modal, Form } from 'react-bootstrap';
import api from '../../api/axios';
import Layout from '../../components/Layout';

function Restock() {
  const [inventory, setInventory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [newProductForm, setNewProductForm] = useState({
    product_name: '',
    warehouse_id: 1,
    quantity: ''
  });

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory');
      setInventory(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch inventory';
      setError(errorMessage);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async () => {
    try {
      const res = await api.get('/inventory/forecast');
      setForecast(res.data);
    } catch (err) {
      console.error('Error fetching forecast:', err);
      // Don't set error state for forecast, just log it
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchForecast();
  }, []);

  const handleRestockClick = (item) => {
    setSelectedItem(item);
    setRestockQuantity('');
    setShowRestockModal(true);
    setError('');
    setSuccess('');
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const quantity = Number(restockQuantity);
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    try {
      const res = await api.post('/inventory/restock', {
        product_name: selectedItem.product_name,
        warehouse_id: selectedItem.warehouse_id,
        quantity: quantity
      });

      setSuccess(`Successfully restocked ${quantity} units of ${selectedItem.product_name}`);
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockQuantity('');
      
      // Refresh inventory list and forecast
      setTimeout(() => {
        fetchInventory();
        fetchForecast();
        setSuccess('');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to restock inventory';
      setError(errorMessage);
    }
  };

  const handleAddNewClick = () => {
    setNewProductForm({
      product_name: '',
      warehouse_id: 1,
      quantity: ''
    });
    setShowAddNewModal(true);
    setError('');
    setSuccess('');
  };

  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const quantity = Number(newProductForm.quantity);
    if (!newProductForm.product_name || !newProductForm.product_name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!quantity || quantity <= 0) {
      setError('Please enter a valid positive quantity');
      return;
    }

    try {
      const res = await api.post('/inventory/restock', {
        product_name: newProductForm.product_name.trim(),
        warehouse_id: newProductForm.warehouse_id,
        quantity: quantity
      });

      setSuccess(`Successfully added ${quantity} units of ${newProductForm.product_name.trim()} to inventory`);
      setShowAddNewModal(false);
      setNewProductForm({
        product_name: '',
        warehouse_id: 1,
        quantity: ''
      });
      
      // Refresh inventory list and forecast
      setTimeout(() => {
        fetchInventory();
        fetchForecast();
        setSuccess('');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add inventory';
      setError(errorMessage);
    }
  };

  const getRecommendedRestock = (productName) => {
    if (!forecast?.data) return 0;
    const forecastItem = forecast.data.find(item => item.product_name === productName);
    return forecastItem?.recommended_restock || 0;
  };

  const getStatusBadge = (quantity, productName) => {
    const recommendedRestock = getRecommendedRestock(productName);
    
    // If restock is recommended, show restock status
    if (recommendedRestock > 0) {
      if (recommendedRestock > 100) {
        return <Badge bg="danger">Restock (High Priority)</Badge>;
      } else if (recommendedRestock > 50) {
        return <Badge bg="warning">Restock (Medium Priority)</Badge>;
      } else {
        return <Badge bg="info">Restock (Low Priority)</Badge>;
      }
    }
    
    // Otherwise, use quantity-based status
    if (quantity > 100) {
      return <Badge bg="success">In Stock</Badge>;
    } else if (quantity > 50) {
      return <Badge bg="warning">Low Stock</Badge>;
    } else {
      return <Badge bg="danger">Critical</Badge>;
    }
  };

  return (
    <Layout>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Restock Inventory</h2>
            <div>
              <Button variant="success" className="me-2" onClick={handleAddNewClick}>
                Add New Product
              </Button>
              <Button variant="secondary" onClick={fetchInventory} disabled={loading}>
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

      {success && (
        <Row>
          <Col>
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5>Current Inventory</h5>
            </Card.Header>
            <Card.Body>
              {loading && inventory.length === 0 ? (
                <div className="text-center p-4">Loading inventory...</div>
              ) : inventory.length === 0 ? (
                <Alert variant="info">No inventory found.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Warehouse</th>
                      <th>Current Quantity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, index) => (
                      <tr key={index}>
                        <td><strong>{item.product_name}</strong></td>
                        <td>{item.warehouse_name}</td>
                        <td>{item.quantity}</td>
                        <td>{getStatusBadge(item.quantity, item.product_name)}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRestockClick(item)}
                          >
                            Restock
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

      {/* Restock Modal */}
      <Modal show={showRestockModal} onHide={() => setShowRestockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Restock Inventory</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleRestockSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            {selectedItem && (
              <>
                <p>
                  <strong>Product:</strong> {selectedItem.product_name}
                </p>
                <p>
                  <strong>Warehouse:</strong> {selectedItem.warehouse_name}
                </p>
                <p>
                  <strong>Current Quantity:</strong> {selectedItem.quantity}
                </p>
                <Form.Group className="mt-3">
                  <Form.Label>Quantity to Add</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter quantity to add"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                    min="1"
                    step="1"
                    required
                    autoFocus
                  />
                  <Form.Text className="text-muted">
                    Enter the quantity you want to add to the current inventory.
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRestockModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Restock
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Add New Product Modal */}
      <Modal show={showAddNewModal} onHide={() => setShowAddNewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product to Inventory</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddNewSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={newProductForm.product_name}
                onChange={(e) => setNewProductForm({ ...newProductForm, product_name: e.target.value })}
                required
                autoFocus
              />
              <Form.Text className="text-muted">
                Enter the name of the product to add to inventory.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Warehouse ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter warehouse ID"
                value={newProductForm.warehouse_id}
                onChange={(e) => setNewProductForm({ ...newProductForm, warehouse_id: Number(e.target.value) })}
                min="1"
                step="1"
                required
              />
              <Form.Text className="text-muted">
                Enter the warehouse ID where this product will be stored.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Initial Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter initial quantity"
                value={newProductForm.quantity}
                onChange={(e) => setNewProductForm({ ...newProductForm, quantity: e.target.value })}
                min="1"
                step="1"
                required
              />
              <Form.Text className="text-muted">
                Enter the initial quantity to add. If the product already exists, this quantity will be added to the existing stock.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddNewModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Add Product
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Restock;

