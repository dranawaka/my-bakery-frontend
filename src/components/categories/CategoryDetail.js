import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Spinner, Alert, Modal, Table } from 'react-bootstrap';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategory();
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const [categoryResponse, subCategoriesResponse, productsResponse] = await Promise.all([
        api.get(`/categories/${id}`),
        api.get(`/categories/parent/${id}`),
        api.get(`/products?categoryId=${id}`)
      ]);
      
      setCategory(categoryResponse.data);
      setSubCategories(subCategoriesResponse.data || []);
      setProducts(productsResponse.data || []);
    } catch (err) {
      setError('Failed to load category details');
      console.error('Error loading category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/categories/${id}`);
      navigate('/categories');
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const response = await api.put(`/categories/${id}/active`, null, {
        params: { active: !category.active }
      });
      setCategory({ ...category, active: !category.active });
    } catch (err) {
      setError('Failed to update category status');
      console.error('Error updating category:', err);
    }
  };

  const getCategoryIcon = (icon) => {
    if (!icon) return <i className="bi bi-folder fs-1"></i>;
    return <i className={`${icon} fs-1`}></i>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
            <Link to="/categories" className="btn btn-outline-danger">
              Back to Categories
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-fluid">
        <Alert variant="warning">
          Category not found
          <div className="mt-3">
            <Link to="/categories" className="btn btn-outline-warning">
              Back to Categories
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Category Details</h2>
        <div>
          <Button
            variant={category.active ? 'warning' : 'success'}
            size="sm"
            onClick={handleToggleActive}
            className="me-2"
          >
            <i className={`bi ${category.active ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
            {category.active ? 'Deactivate' : 'Activate'}
          </Button>
          <Link to={`/categories/${id}/edit`} className="btn btn-primary me-2">
            <i className="bi bi-pencil me-2"></i>
            Edit
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="bi bi-trash me-2"></i>
            Delete
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Category Information */}
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {getCategoryIcon(category.icon)}
                </div>
                <div>
                  <h4 className="mb-1">{category.name}</h4>
                  <Badge bg={category.active ? 'success' : 'secondary'}>
                    {category.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {category.description && (
                <p className="text-muted mb-3">{category.description}</p>
              )}
              
              <Row>
                <Col md={6}>
                  <strong>Parent Category:</strong>
                  <p className="text-muted">
                    {category.parentId ? 'Has Parent' : 'Root Category'}
                  </p>
                </Col>
                <Col md={6}>
                  <strong>Sort Order:</strong>
                  <p className="text-muted">
                    {category.sortOrder || 'Not set'}
                  </p>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <strong>Created:</strong>
                  <p className="text-muted">
                    {formatDate(category.createdAt)}
                  </p>
                </Col>
                <Col md={6}>
                  <strong>Last Updated:</strong>
                  <p className="text-muted">
                    {formatDate(category.updatedAt)}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Subcategories */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Subcategories ({subCategories.length})</h5>
              <Link to="/categories/new" className="btn btn-sm btn-outline-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Subcategory
              </Link>
            </Card.Header>
            <Card.Body>
              {subCategories.length > 0 ? (
                <Row>
                  {subCategories.map((subCategory) => (
                    <Col key={subCategory.id} md={6} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <i className={`${subCategory.icon || 'bi-folder'} fs-4`}></i>
                              </div>
                              <div>
                                <h6 className="mb-1">{subCategory.name}</h6>
                                <Badge bg={subCategory.active ? 'success' : 'secondary'} size="sm">
                                  {subCategory.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                            <Link to={`/categories/${subCategory.id}`} className="btn btn-sm btn-outline-secondary">
                              View
                            </Link>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-folder-x fs-1 text-muted mb-3"></i>
                  <h6>No subcategories</h6>
                  <p className="text-muted">This category doesn't have any subcategories yet.</p>
                  <Link to="/categories/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Subcategory
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Products in this category */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Products ({products.length})</h5>
              <Link to="/products/new" className="btn btn-sm btn-outline-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Add Product
              </Link>
            </Card.Header>
            <Card.Body>
              {products.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="me-2"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">{product.description}</small>
                            </div>
                          </div>
                        </td>
                        <td>${product.price}</td>
                        <td>
                          <Badge bg={product.active ? 'success' : 'secondary'}>
                            {product.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <Link to={`/products/${product.id}`} className="btn btn-sm btn-outline-secondary">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-box fs-1 text-muted mb-3"></i>
                  <h6>No products</h6>
                  <p className="text-muted">No products are assigned to this category yet.</p>
                  <Link to="/products/new" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Create Product
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Link to={`/categories/${id}/edit`} className="btn btn-primary">
                  <i className="bi bi-pencil me-2"></i>
                  Edit Category
                </Link>
                <Link to="/categories/new" className="btn btn-outline-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Subcategory
                </Link>
                <Link to="/products/new" className="btn btn-outline-success">
                  <i className="bi bi-box me-2"></i>
                  Add Product
                </Link>
                <Link to="/categories" className="btn btn-outline-secondary">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Categories
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Category Statistics */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subcategories:</span>
                <Badge bg="info">{subCategories.length}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Products:</span>
                <Badge bg="success">{products.length}</Badge>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Status:</span>
                <Badge bg={category.active ? 'success' : 'secondary'}>
                  {category.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Sort Order:</span>
                <span className="text-muted">{category.sortOrder || 'Not set'}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{category.name}"? This action cannot be undone.
          {subCategories.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This category has {subCategories.length} subcategories that will also be affected.
            </Alert>
          )}
          {products.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This category has {products.length} products that will be affected.
            </Alert>
          )}
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
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoryDetail; 