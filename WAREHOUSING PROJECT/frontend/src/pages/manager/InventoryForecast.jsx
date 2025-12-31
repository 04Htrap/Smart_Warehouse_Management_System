import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button, Badge } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../api/axios';
import Layout from '../../components/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function InventoryForecast() {
  const [inventory, setInventory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory/forecast');
      setForecast(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchForecast();
  }, []);

  const getInventoryChartData = () => {
    if (!inventory || inventory.length === 0) return null;

    const labels = inventory.map(item => item.product_name);
    const quantities = inventory.map(item => item.quantity);

    return {
      labels,
      datasets: [
        {
          label: 'Current Inventory',
          data: quantities,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getForecastChartData = () => {
    if (!forecast?.data || forecast.data.length === 0) return null;

    const labels = forecast.data.map(item => item.product_name);
    const currentInventory = forecast.data.map(item => item.current_inventory);
    const predictedDemand = forecast.data.map(item => item.predicted_demand);

    return {
      labels,
      datasets: [
        {
          label: 'Current Inventory',
          data: currentInventory,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Predicted Demand',
          data: predictedDemand,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Inventory Levels',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Layout>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Inventory & Forecast</h2>
            <div>
              <Button
                variant={activeTab === 'inventory' ? 'primary' : 'outline-primary'}
                className="me-2"
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </Button>
              <Button
                variant={activeTab === 'forecast' ? 'primary' : 'outline-primary'}
                onClick={() => setActiveTab('forecast')}
              >
                Forecast
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

      {activeTab === 'inventory' && (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>Current Inventory Levels</h5>
                    <Button variant="secondary" size="sm" onClick={fetchInventory} disabled={loading}>
                      Refresh
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {loading && inventory.length === 0 ? (
                    <div className="text-center p-4">Loading inventory...</div>
                  ) : inventory.length === 0 ? (
                    <Alert variant="info">No inventory data available.</Alert>
                  ) : (
                    <>
                      {getInventoryChartData() && (
                        <div className="mb-4" style={{ height: '300px' }}>
                          <Bar data={getInventoryChartData()} options={chartOptions} />
                        </div>
                      )}
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Warehouse</th>
                            <th>Quantity</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product_name}</td>
                              <td>{item.warehouse_name}</td>
                              <td>{item.quantity}</td>
                              <td>
                                {item.quantity > 100 ? (
                                  <Badge bg="success">In Stock</Badge>
                                ) : item.quantity > 50 ? (
                                  <Badge bg="warning">Low Stock</Badge>
                                ) : (
                                  <Badge bg="danger">Critical</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'forecast' && (
        <>
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>Demand Forecast & Restock Recommendations</h5>
                    <Button variant="secondary" size="sm" onClick={fetchForecast} disabled={loading}>
                      Refresh
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  {forecast && (
                    <Alert variant="info" className="mb-4">
                      <strong>Forecast Strategy:</strong> {forecast.strategy || 'Event-based Moving Average (last 5 sales)'}
                    </Alert>
                  )}
                  {loading && !forecast ? (
                    <div className="text-center p-4">Loading forecast...</div>
                  ) : !forecast?.data || forecast.data.length === 0 ? (
                    <Alert variant="info">No forecast data available.</Alert>
                  ) : (
                    <>
                      {getForecastChartData() && (
                        <div className="mb-4" style={{ height: '300px' }}>
                          <Bar data={getForecastChartData()} options={chartOptions} />
                        </div>
                      )}
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>Current Inventory</th>
                            <th>Predicted Demand</th>
                            <th>Recommended Restock</th>
                            <th>Priority</th>
                          </tr>
                        </thead>
                        <tbody>
                          {forecast.data.map((item, index) => (
                            <tr key={index}>
                              <td>{item.product_name}</td>
                              <td>{item.current_inventory}</td>
                              <td>{item.predicted_demand}</td>
                              <td>
                                <Badge bg={item.recommended_restock > 0 ? 'warning' : 'success'}>
                                  {item.recommended_restock > 0 ? item.recommended_restock : 'No restock needed'}
                                </Badge>
                              </td>
                              <td>
                                {item.recommended_restock > 100 ? (
                                  <Badge bg="danger">High Priority</Badge>
                                ) : item.recommended_restock > 50 ? (
                                  <Badge bg="warning">Medium Priority</Badge>
                                ) : item.recommended_restock > 0 ? (
                                  <Badge bg="info">Low Priority</Badge>
                                ) : (
                                  <Badge bg="success">No Action</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Layout>
  );
}

export default InventoryForecast;

