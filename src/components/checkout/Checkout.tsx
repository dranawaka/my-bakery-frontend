import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items: cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    deliveryMethod: 'PICKUP',
    paymentMethod: 'CASH',
    notes: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateTax = (): number => {
    return totalAmount * 0.085;
  };

  const calculateTotal = (): number => {
    return totalAmount + calculateTax();
  };

  const validateForm = (): boolean => {
    if (formData.deliveryMethod === 'DELIVERY') {
      const shipping = formData.shippingAddress;
      if (!shipping.street || !shipping.city || !shipping.state || !shipping.zipCode) {
        setError('Please fill in all shipping address fields for delivery');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setProcessing(true);
      
      // Create order
      const orderData: any = {
        customerId: user?.id || 1, // Default to user ID or 1 for demo
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        totalAmount: calculateTotal(),
        taxAmount: calculateTax(),
        shippingAmount: formData.deliveryMethod === 'DELIVERY' ? 5.00 : 0.00,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      if (formData.deliveryMethod === 'DELIVERY') {
        orderData.shippingAddress = formData.shippingAddress;
      }

      const orderResponse = await api.post('/orders', orderData);
      const order = orderResponse.data;

      // Process payment if not cash
      if (formData.paymentMethod !== 'CASH') {
        await api.post('/payments/process', {
          orderId: order.id,
          paymentMethod: formData.paymentMethod
        });
      }

      // Clear cart
      await clearCart();

      setSuccess('Order created successfully!');
      
      setTimeout(() => {
        navigate(`/orders/${order.id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create order');
      console.error('Error creating order:', err);
    } finally {
      setProcessing(false);
    }
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

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Checkout</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/cart')}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Cart
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Form onSubmit={handleSubmit}>
            {/* Delivery Method */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Delivery Method</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id="pickup"
                    name="deliveryMethod"
                    value="PICKUP"
                    checked={formData.deliveryMethod === 'PICKUP'}
                    onChange={handleChange}
                    label="Pickup (Free)"
                  />
                  <Form.Check
                    type="radio"
                    id="delivery"
                    name="deliveryMethod"
                    value="DELIVERY"
                    checked={formData.deliveryMethod === 'DELIVERY'}
                    onChange={handleChange}
                    label="Delivery ($5.00)"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Shipping Address */}
            {formData.deliveryMethod === 'DELIVERY' && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Shipping Address</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Street Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="shippingAddress.street"
                          value={formData.shippingAddress.street}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="shippingAddress.city"
                          value={formData.shippingAddress.city}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="shippingAddress.state"
                          value={formData.shippingAddress.state}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>ZIP Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="shippingAddress.zipCode"
                          value={formData.shippingAddress.zipCode}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* Payment Method */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Method</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    value="CASH"
                    checked={formData.paymentMethod === 'CASH'}
                    onChange={handleChange}
                    label="Cash on Pickup/Delivery"
                  />
                  <Form.Check
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={formData.paymentMethod === 'CREDIT_CARD'}
                    onChange={handleChange}
                    label="Credit Card"
                  />
                  <Form.Check
                    type="radio"
                    id="paypal"
                    name="paymentMethod"
                    value="PAYPAL"
                    checked={formData.paymentMethod === 'PAYPAL'}
                    onChange={handleChange}
                    label="PayPal"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Order Notes */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions or notes for your order..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Form>
        </Col>

        <Col lg={4}>
          {/* Order Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              className="me-2"
                            />
                          )}
                          <div>
                            <strong>{item.product.name}</strong>
                            <br />
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end">{formatPrice(item.product.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                                        <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (8.5%):</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              {formData.deliveryMethod === 'DELIVERY' && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(5.00)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-primary">{formatPrice(calculateTotal())}</strong>
              </div>
            </Card.Body>
          </Card>

          {/* Place Order Button */}
          <Card>
            <Card.Body>
              <Button
                variant="success"
                size="lg"
                className="w-100"
                type="submit"
                disabled={processing || cart.length === 0}
              >
                {processing ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Place Order
                  </>
                )}
              </Button>
              <small className="text-muted d-block text-center mt-2">
                By placing this order, you agree to our terms and conditions.
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout; 