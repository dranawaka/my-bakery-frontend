import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Spinner, Alert, Table, Modal } from 'react-bootstrap';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/orders/${id}/status`, null, {
        params: { status: newStatus }
      });
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      setError('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      await api.put(`/orders/${id}/cancel`);
      setOrder({ ...order, status: 'CANCELLED' });
      setShowCancelModal(false);
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
      month: 'long',
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'PENDING': 'CONFIRMED',
      'CONFIRMED': 'PREPARING',
      'PREPARING': 'READY',
      'READY': 'COMPLETED'
    };
    return statusFlow[currentStatus];
  };

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

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Link to="/orders" className="btn btn-outline-danger">
              Back to Orders
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-fluid">
        <Alert variant="warning">
          Order not found
          <div className="mt-3">
            <Link to="/orders" className="btn btn-outline-warning">
              Back to Orders
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order Details</h2>
        <div>
          {order.status === 'PENDING' && (
            <>
              <Button
                variant="success"
                onClick={() => handleStatusUpdate('CONFIRMED')}
                className="me-2"
              >
                <i className="bi bi-check me-2"></i>
                Confirm Order
              </Button>
              <Button
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                <i className="bi bi-x me-2"></i>
                Cancel Order
              </Button>
            </>
          )}
          {order.status === 'CONFIRMED' && (
            <Button
              variant="primary"
              onClick={() => handleStatusUpdate('PREPARING')}
            >
              <i className="bi bi-gear me-2"></i>
              Start Preparing
            </Button>
          )}
          {order.status === 'PREPARING' && (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate('READY')}
            >
              <i className="bi bi-check-circle me-2"></i>
              Mark Ready
            </Button>
          )}
          {order.status === 'READY' && (
            <Button
              variant="success"
              onClick={() => handleStatusUpdate('COMPLETED')}
            >
              <i className="bi bi-check2-all me-2"></i>
              Complete Order
            </Button>
          )}
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Order Information */}
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Order Information</h5>
                {getStatusBadge(order.status)}
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Order Number:</strong> {order.orderNumber}</p>
                  <p><strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                  <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Customer:</strong> {order.customerName || 'Unknown Customer'}</p>
                  <p><strong>Total Amount:</strong> {formatPrice(order.totalAmount)}</p>
                  <p><strong>Tax Amount:</strong> {formatPrice(order.taxAmount || 0)}</p>
                  <p><strong>Shipping Amount:</strong> {formatPrice(order.shippingAmount || 0)}</p>
                </Col>
              </Row>
              {order.notes && (
                <Row>
                  <Col md={12}>
                    <p><strong>Notes:</strong></p>
                    <p className="text-muted">{order.notes}</p>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              {order.items && order.items.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                className="me-2"
                              />
                            )}
                            <div>
                              <strong>{item.name}</strong>
                              <br />
                              <small className="text-muted">SKU: {item.sku}</small>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No items found for this order.</p>
              )}
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Shipping Address</h5>
              </Card.Header>
              <Card.Body>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Order Status */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Current Status:</strong>
                <div className="mt-2">{getStatusBadge(order.status)}</div>
              </div>
              
              {getNextStatus(order.status) && (
                <div className="mb-3">
                  <strong>Next Action:</strong>
                  <div className="mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStatusUpdate(getNextStatus(order.status))}
                    >
                      Mark as {getNextStatus(order.status)}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <strong>Order Timeline:</strong>
                <div className="mt-2">
                  <small className="text-muted">
                    <div>Created: {formatDate(order.createdAt)}</div>
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <div>Last Updated: {formatDate(order.updatedAt)}</div>
                    )}
                    {order.deliveryDate && (
                      <div>Delivery Date: {formatDate(order.deliveryDate)}</div>
                    )}
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Payment Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatPrice(order.totalAmount - (order.taxAmount || 0) - (order.shippingAmount || 0))}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax:</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping:</span>
                  <span>{formatPrice(order.shippingAmount)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary">{formatPrice(order.totalAmount)}</strong>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Payment Method: {order.paymentMethod}<br />
                  Payment Status: {order.paymentStatus || 'Pending'}
                </small>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to="/orders" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Orders
                </Link>
                <Button variant="outline-primary">
                  <i className="bi bi-printer me-2"></i>
                  Print Invoice
                </Button>
                <Button variant="outline-info">
                  <i className="bi bi-envelope me-2"></i>
                  Send Email
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Order Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel order "{order?.orderNumber}"? 
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

export default OrderDetail; 