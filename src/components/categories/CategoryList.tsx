import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, InputGroup, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setDeleting(true);
      await api.delete(`/categories/${categoryToDelete.id}`);
      setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError('Failed to delete category');
      console.error('Error deleting category:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const response = await api.put(`/categories/${category.id}/active`, null, {
        params: { active: !category.active }
      });
      setCategories(categories.map(cat => 
        cat.id === category.id ? { ...cat, active: !cat.active } : cat
      ));
    } catch (err) {
      setError('Failed to update category status');
      console.error('Error updating category:', err);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = !showActiveOnly || category.active;
    return matchesSearch && matchesActive;
  });

  const getCategoryIcon = (icon) => {
    if (!icon) return <i className="bi bi-folder fs-4"></i>;
    return <i className={`${icon} fs-4`}></i>;
  };

  const getParentName = (parentId) => {
    if (!parentId) return 'Root Category';
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : 'Unknown Parent';
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
        <h2>Categories</h2>
        <Link to="/categories/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>
          Add Category
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
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                id="active-only"
                label="Show active only"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            </Col>
            <Col md={3} className="text-end">
              <Button variant="outline-secondary" onClick={loadCategories}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Categories Grid */}
      <Row>
        {filteredCategories.map((category) => (
          <Col key={category.id} lg={4} md={6} className="mb-4">
            <Card className="h-100 category-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h5 className="mb-1">{category.name}</h5>
                      <small className="text-muted">
                        Parent: {getParentName(category.parentId)}
                      </small>
                    </div>
                  </div>
                  <div className="dropdown">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="dropdown-toggle"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-three-dots"></i>
                    </Button>
                    <ul className="dropdown-menu">
                      <li>
                        <Link className="dropdown-item" to={`/categories/${category.id}`}>
                          <i className="bi bi-eye me-2"></i>View
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to={`/categories/${category.id}/edit`}>
                          <i className="bi bi-pencil me-2"></i>Edit
                        </Link>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleToggleActive(category)}
                        >
                          <i className={`bi ${category.active ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                          {category.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button
                          className="dropdown-item text-danger"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="bi bi-trash me-2"></i>Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {category.description && (
                  <p className="text-muted mb-3">{category.description}</p>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Badge bg={category.active ? 'success' : 'secondary'} className="me-2">
                      {category.active ? 'Active' : 'Inactive'}
                    </Badge>
                    {category.sortOrder && (
                      <Badge bg="info">Order: {category.sortOrder}</Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    {category.subCategories?.length || 0} subcategories
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredCategories.length === 0 && !loading && (
        <Card>
          <Card.Body className="text-center py-5">
            <i className="bi bi-folder-x fs-1 text-muted mb-3"></i>
            <h5>No categories found</h5>
            <p className="text-muted">
              {searchTerm || showActiveOnly 
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by creating your first category.'
              }
            </p>
            {!searchTerm && !showActiveOnly && (
              <Link to="/categories/new" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Create Category
              </Link>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
          {categoryToDelete?.subCategories?.length > 0 && (
            <Alert variant="warning" className="mt-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              This category has {categoryToDelete.subCategories.length} subcategories that will also be affected.
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

export default CategoryList; 