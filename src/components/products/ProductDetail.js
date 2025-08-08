import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product && quantity > 0) {
      try {
        await addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: parseInt(quantity)
        });
        setSuccessMessage(`${product.name} added to cart successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/products/${id}`);
      navigate('/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
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

  if (error) {
    return (
      <div className="container-fluid">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Link to="/products" className="btn btn-outline-danger">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-fluid">
        <Alert variant="warning">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn btn-outline-warning">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/products" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </div>
        <div>
          <Link to={`/products/${id}/edit`} className="btn btn-primary me-2">
            <i className="bi bi-pencil me-2"></i>
            Edit Product
          </Link>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash me-2"></i>
            Delete
          </Button>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
            </div>
            <Link to="/cart" className="btn btn-outline-success btn-sm">
              <i className="bi bi-cart me-1"></i>
              View Cart
            </Link>
          </div>
        </Alert>
      )}

      <Row>
        {/* Product Image */}
        <Col lg={6} className="mb-4">
          <Card>
            {product.imageUrl ? (
              <Card.Img 
                variant="top" 
                src={product.imageUrl} 
                alt={product.name}
                style={{ maxHeight: '500px', objectFit: 'cover' }}
              />
            ) : (
              <div 
                className="bg-light d-flex align-items-center justify-content-center"
                style={{ height: '400px' }}
              >
                <i className="bi bi-image display-1 text-muted"></i>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Details */}
        <Col lg={6}>
          <Card>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h2 className="mb-0">{product.name}</h2>
                  <div>
                    {product.featured && (
                      <Badge bg="warning" text="dark" className="me-1">
                        <i className="bi bi-star-fill me-1"></i>
                        Featured
                      </Badge>
                    )}
                    {!product.active && (
                      <Badge bg="danger">
                        <i className="bi bi-x-circle me-1"></i>
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <Badge bg="secondary" className="me-1">
                    {product.category?.name || 'Uncategorized'}
                  </Badge>
                  <Badge bg="info">
                    SKU: {product.sku}
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-primary mb-2">{formatPrice(product.price)}</h3>
                <p className="text-muted mb-3">{product.description}</p>
              </div>

              {/* Product Information */}
              <Row className="mb-4">
                <Col sm={6}>
                  <div className="mb-3">
                    <strong>Stock Quantity:</strong>
                    <br />
                    <span className={product.stockQuantity > 0 ? 'text-success' : 'text-danger'}>
                      {product.stockQuantity || 0} units
                    </span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <strong>Cost Price:</strong>
                    <br />
                    <span className="text-muted">{formatPrice(product.costPrice || 0)}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <strong>Barcode:</strong>
                    <br />
                    <span className="text-muted">{product.barcode || 'N/A'}</span>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-3">
                    <strong>Created:</strong>
                    <br />
                    <span className="text-muted">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Col>
              </Row>

              {/* Add to Cart Section */}
              {product.active && product.stockQuantity > 0 && (
                <div className="border-top pt-3">
                  <h5>Add to Cart</h5>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: '120px' }}>
                      <label className="form-label">Quantity:</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max={product.stockQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={quantity > product.stockQuantity}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </Button>
                  </div>
                  {quantity > product.stockQuantity && (
                    <small className="text-danger">
                      Quantity exceeds available stock
                    </small>
                  )}
                </div>
              )}

              {(!product.active || product.stockQuantity <= 0) && (
                <div className="border-top pt-3">
                  <Alert variant="warning" className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    This product is currently unavailable
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{product.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Product'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetail; 