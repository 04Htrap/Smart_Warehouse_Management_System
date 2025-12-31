import { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Button, Table, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import Layout from '../../components/Layout';

function RouteOptimization() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOptimizedRoute = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/routes/optimize/from-orders');
      setRouteData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch optimized route');
      if (err.response?.status === 404 || err.response?.data?.message) {
        setRouteData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimizedRoute();
  }, []);

  return (
    <Layout>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Route Optimization</h2>
            <Button variant="primary" onClick={fetchOptimizedRoute} disabled={loading}>
              {loading ? 'Optimizing...' : 'Optimize Route'}
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

      {loading && !routeData ? (
        <Row>
          <Col>
            <Card>
              <Card.Body className="text-center p-4">
                Optimizing route...
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : !routeData || routeData.message ? (
        <Row>
          <Col>
            <Alert variant="info">
              {routeData?.message || 'No pending orders to optimize. Create orders first to see optimized routes.'}
            </Alert>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Route Summary</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Strategy:</strong> {routeData.strategy || 'Nearest Neighbor'}</p>
                  <p><strong>Total Distance:</strong> <Badge bg="primary">{routeData.total_distance_km} km</Badge></p>
                  <p><strong>Total Cities:</strong> {routeData.route?.length || 0}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Route Visualization</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                    {routeData.route && routeData.route.length > 0 && (
                      <div>
                        <div className="mb-2">
                          <strong>📍 Warehouse (Start)</strong>
                        </div>
                        {routeData.route.map((stop, index) => (
                          <div key={index} className="mb-2">
                            <div>↓ {stop.distance_from_previous_km} km</div>
                            <div>
                              <strong>{index + 1}. {stop.city}</strong>
                              <Badge bg="secondary" className="ms-2">
                                {stop.orders?.length || 0} order(s)
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col>
              <Card>
                <Card.Header>
                  <h5>Detailed Route Sequence</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Sequence</th>
                        <th>City</th>
                        <th>Distance from Previous (km)</th>
                        <th>Orders</th>
                        <th>Cumulative Distance (km)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routeData.route && routeData.route.map((stop, index) => {
                        const cumulativeDistance = routeData.route
                          .slice(0, index + 1)
                          .reduce((sum, s) => sum + parseFloat(s.distance_from_previous_km || 0), 0);
                        
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td><strong>{stop.city}</strong></td>
                            <td>{parseFloat(stop.distance_from_previous_km || 0).toFixed(2)}</td>
                            <td>
                              {stop.orders?.map((orderId, i) => (
                                <Badge key={i} bg="info" className="me-1">
                                  #{orderId}
                                </Badge>
                              ))}
                            </td>
                            <td>{cumulativeDistance.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      {routeData.route && routeData.route.length > 0 && (
                        <tr className="table-primary">
                          <td colSpan="4"><strong>Total Distance</strong></td>
                          <td><strong>{routeData.total_distance_km} km</strong></td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Layout>
  );
}

export default RouteOptimization;

