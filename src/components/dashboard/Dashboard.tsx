import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Alert } from 'react-bootstrap';
import StatsCard from './StatsCard';
import SalesChart from './SalesChart';
import RecentOrdersTable from './RecentOrdersTable';
import OrderStatusChart from './OrderStatusChart';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    loadRecentOrders();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get('/analytics/dashboard-summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await api.get('/analytics/recent-orders');
      setRecentOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load recent orders:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PREPARING': 'primary',
      'READY': 'success',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'REFUNDED': 'secondary'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-download me-1"></i>
              Export
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-printer me-1"></i>
              Print
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Key Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <StatsCard
            title="Total Revenue"
            value={dashboardData?.totalRevenue || 0}
            icon="currency-dollar"
            color="primary"
            format="currency"
            trend={5.2}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Total Orders"
            value={dashboardData?.totalOrders || 0}
            icon="cart"
            color="success"
            format="number"
            trend={3.8}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Pending Orders"
            value={dashboardData?.pendingOrdersCount || 0}
            icon="clock"
            color="warning"
            format="number"
            trend={0}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Low Stock Items"
            value={dashboardData?.lowStockCount || 0}
            icon="exclamation-triangle"
            color="danger"
            format="number"
            trend={0}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sales Overview</h5>
              <div className="btn-group btn-group-sm">
                <Button variant="outline-secondary" size="sm">7D</Button>
                <Button variant="outline-secondary" size="sm" active>30D</Button>
                <Button variant="outline-secondary" size="sm">90D</Button>
              </div>
            </Card.Header>
            <Card.Body>
              <SalesChart data={dashboardData?.salesData || []} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Status Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <OrderStatusChart orders={recentOrders} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders and Top Products */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Button variant="outline-primary" size="sm">
                View All Orders
              </Button>
            </Card.Header>
            <Card.Body>
              <RecentOrdersTable orders={recentOrders} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Selling Products</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.topProducts?.length > 0 ? (
                <div>
                  {dashboardData.topProducts.map((product, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold text-muted">{index + 1}</span>
                        </div>
                        <div>
                          <div className="fw-semibold">{product.name}</div>
                          <small className="text-muted">{product.quantity} units sold</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold text-success">
                          {formatCurrency(product.revenue || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2 d-md-block">
                <Button variant="primary" className="me-2 mb-2">
                  <i className="bi bi-plus-circle me-1"></i>
                  Create Order
                </Button>
                <Button variant="success" className="me-2 mb-2">
                  <i className="bi bi-box me-1"></i>
                  Add Product
                </Button>
                <Button variant="info" className="me-2 mb-2">
                  <i className="bi bi-people me-1"></i>
                  Add Customer
                </Button>
                <Button variant="warning" className="me-2 mb-2">
                  <i className="bi bi-graph-up me-1"></i>
                  View Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Database</span>
                <Badge bg="success">Online</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Payment Gateway</span>
                <Badge bg="success">Connected</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Inventory System</span>
                <Badge bg="success">Synced</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Last Backup</span>
                <small className="text-muted">2 hours ago</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 
