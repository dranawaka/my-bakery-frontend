import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setCancelling(true);
      await api.put(`/orders/${orderToCancel.id}/cancel`);
      setOrders(orders.map(order => 
        order.id === orderToCancel.id ? { ...order, status: 'CANCELLED' } : order
      ));
      setShowCancelModal(false);
      setOrderToCancel(null);
    } catch (err) {
      setError('Failed to cancel order');
      console.error('Error cancelling order:', err);
    } finally {
      setCancelling(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesDate = !dateFilter || order.orderDate?.includes(dateFilter);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Orders</h2>
        <Link to="/checkout" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Create New Order
        </Link>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" onClick={loadOrders}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clipboard-x fs-1 text-muted mb-3"></i>
              <h5>No orders found</h5>
              <p className="text-muted">
                {searchTerm || statusFilter || dateFilter 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No orders have been created yet.'
                }
              </p>
              {!searchTerm && !statusFilter && !dateFilter && (
                <Link to="/checkout" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create First Order
                </Link>
              )}
            </div>
          ) : (
            <Table responsive>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>{order.customerName || 'Unknown Customer'}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{formatPrice(order.totalAmount)}</td>
                    <td>
                      <Badge bg="info">{order.items?.length || 0} items</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link 
                          to={`/orders/${order.id}`} 
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                        {order.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                            >
                              <i className="bi bi-check"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setOrderToCancel(order);
                                setShowCancelModal(true);
                              }}
                            >
                              <i className="bi bi-x"></i>
                            </Button>
                          </>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                          >
                            <i className="bi bi-gear"></i>
                          </Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                          >
                            <i className="bi bi-check-circle"></i>
                          </Button>
                        )}
                        {order.status === 'READY' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                          >
                            <i className="bi bi-check2-all"></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Cancel Order Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel order "{orderToCancel?.orderNumber}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Order'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderList; 