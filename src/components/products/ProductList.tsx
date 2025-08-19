import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, InputGroup, Button, Badge, Spinner, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProductList: React.FC = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [quickAddingProduct, setQuickAddingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category?.id === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowAddToCartModal(true);
  };

  const confirmAddToCart = async () => {
    if (!selectedProduct || quantity <= 0) return;
    
    try {
      setAddingToCart(true);
      addItem(selectedProduct, quantity);
      setShowAddToCartModal(false);
      setSelectedProduct(null);
      setQuantity(1);
      setSuccessMessage(`${selectedProduct.name} added to cart successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const quickAddToCart = async (product) => {
    try {
      setQuickAddingProduct(product.id);
      addItem(product, 1);
      setSuccessMessage(`${product.name} added to cart successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setQuickAddingProduct(null);
    }
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
        <h2>Products</h2>
        <Link to="/products/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add Product
        </Link>
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

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Products</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSortBy('name');
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Grid */}
      <Row>
        {filteredProducts.length === 0 ? (
          <Col>
            <Card>
              <Card.Body className="text-center py-5">
                <i className="bi bi-box display-1 text-muted"></i>
                <h4 className="mt-3">No products found</h4>
                <p className="text-muted">Try adjusting your search or filters</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredProducts.map(product => (
            <Col key={product.id} lg={3} md={4} sm={6} className="mb-4">
              <Card className="h-100 product-card">
                <div className="position-relative">
                  {product.imageUrl ? (
                    <Card.Img 
                      variant="top" 
                      src={product.imageUrl} 
                      alt={product.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="bg-light d-flex align-items-center justify-content-center"
                      style={{ height: '200px' }}
                    >
                      <i className="bi bi-image display-4 text-muted"></i>
                    </div>
                  )}
                  <div className="position-absolute top-0 end-0 m-2">
                    {product.featured && (
                      <Badge bg="warning" text="dark">
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
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-1">
                      {product.category?.name || 'Uncategorized'}
                    </Badge>
                    <Badge bg="info">
                      SKU: {product.sku}
                    </Badge>
                  </div>
                  <Card.Title className="h6 mb-2">{product.name}</Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 && '...'}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h5 mb-0 text-primary">{formatPrice(product.price)}</span>
                      <div className="text-end">
                        <small className="text-muted d-block">
                          Stock: {product.stockQuantity || 0}
                        </small>
                        <span className={`stock-status ${
                          product.stockQuantity > 10 ? 'in-stock' : 
                          product.stockQuantity > 0 ? 'low-stock' : 'out-of-stock'
                        }`}>
                          <i className={`bi ${
                            product.stockQuantity > 10 ? 'bi-check-circle' : 
                            product.stockQuantity > 0 ? 'bi-exclamation-triangle' : 'bi-x-circle'
                          }`}></i>
                          {product.stockQuantity > 10 ? 'In Stock' : 
                           product.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    <div className="d-grid gap-2">
                      <Link 
                        to={`/products/${product.id}`} 
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Details
                      </Link>
                      {product.active && product.stockQuantity > 0 && (
                        <>
                          <Button 
                            variant="success" 
                            size="sm"
                            className="btn-add-to-cart"
                            onClick={() => handleAddToCart(product)}
                          >
                            <i className="bi bi-cart-plus me-1"></i>
                            Add to Cart
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            className="btn-quick-add"
                            onClick={() => quickAddToCart(product)}
                            disabled={quickAddingProduct === product.id}
                            title="Quick add 1 to cart"
                          >
                            {quickAddingProduct === product.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <i className="bi bi-cart-plus me-1"></i>
                                Quick Add
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      <Link 
                        to={`/products/${product.id}/edit`} 
                        className="btn btn-outline-secondary btn-sm"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Link>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Add to Cart Modal */}
      <Modal show={showAddToCartModal} onHide={() => setShowAddToCartModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              <div className="d-flex align-items-center mb-3">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem' }}
                    className="me-3"
                  />
                ) : (
                  <div 
                    className="bg-light d-flex align-items-center justify-content-center me-3"
                    style={{ width: '60px', height: '60px', borderRadius: '0.25rem' }}
                  >
                    <i className="bi bi-image text-muted"></i>
                  </div>
                )}
                <div>
                  <h6 className="mb-0">{selectedProduct.name}</h6>
                  <small className="text-muted">Price: {formatPrice(selectedProduct.price)}</small>
                </div>
              </div>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedProduct.stockQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <Form.Text className="text-muted">
                  Available stock: {selectedProduct.stockQuantity} units
                </Form.Text>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddToCartModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={confirmAddToCart}
            disabled={addingToCart || quantity > (selectedProduct?.stockQuantity || 0)}
          >
            {addingToCart ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              <>
                <i className="bi bi-cart-plus me-2"></i>
                Add to Cart
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductList; 