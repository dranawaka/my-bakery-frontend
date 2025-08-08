import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Cart = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getCartTotal } = useCart();
  const [showClearModal, setShowClearModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      return;
    }
    
    try {
      setUpdatingItem(itemId);
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setRemovingItem(itemId);
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Shopping Cart</h2>
        {cart.length > 0 && (
          <Button 
            variant="outline-danger" 
            onClick={() => setShowClearModal(true)}
          >
            <i className="bi bi-trash me-2"></i>
            Clear Cart
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-cart display-1 text-muted"></i>
            <h4 className="mt-3">Your cart is empty</h4>
            <p className="text-muted">Add some products to get started</p>
            <Link to="/products" className="btn btn-primary">
              <i className="bi bi-shop me-2"></i>
              Browse Products
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem' }}
                              className="me-3"
                            />
                          ) : (
                            <div 
                              className="bg-light d-flex align-items-center justify-content-center me-3"
                              style={{ width: '50px', height: '50px', borderRadius: '0.25rem' }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                          <div>
                            <h6 className="mb-0">{item.name}</h6>
                            <small className="text-muted">SKU: {item.sku}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={updatingItem === item.id}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <span className="mx-2" style={{ minWidth: '30px', textAlign: 'center' }}>
                            {updatingItem === item.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updatingItem === item.id}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                      </td>
                      <td>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItem === item.id}
                        >
                          {removingItem === item.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Cart Summary */}
          <Card className="mt-4">
            <Card.Body>
              <div className="row">
                <div className="col-md-6">
                  <h5>Cart Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (8.5%):</span>
                    <span>{formatPrice(getCartTotal() * 0.085)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <strong>Total:</strong>
                    <strong className="text-primary">{formatPrice(getCartTotal() * 1.085)}</strong>
                  </div>
                </div>
                <div className="col-md-6 d-flex align-items-end justify-content-end">
                  <div className="d-grid gap-2 d-md-flex">
                    <Link to="/products" className="btn btn-outline-secondary">
                      <i className="bi bi-arrow-left me-2"></i>
                      Continue Shopping
                    </Link>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      <i className="bi bi-credit-card me-2"></i>
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Clear Cart Confirmation Modal */}
      <Modal show={showClearModal} onHide={() => setShowClearModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove all items from your cart? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearCart}>
            <i className="bi bi-trash me-2"></i>
            Clear Cart
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cart; 