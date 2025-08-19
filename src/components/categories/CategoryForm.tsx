import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'bi-folder',
    parentId: '',
    sortOrder: '',
    active: true
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const iconOptions = [
    { value: 'bi-folder', label: '📁 Folder' },
    { value: 'bi-cake', label: '🎂 Cake' },
    { value: 'bi-bread', label: '🍞 Bread' },
    { value: 'bi-cup-hot', label: '☕ Hot Drink' },
    { value: 'bi-cup-straw', label: '🥤 Cold Drink' },
    { value: 'bi-egg-fried', label: '🍳 Pastry' },
    { value: 'bi-cookie', label: '🍪 Cookie' },
    { value: 'bi-gift', label: '🎁 Gift' },
    { value: 'bi-star', label: '⭐ Special' },
    { value: 'bi-heart', label: '❤️ Favorite' },
    { value: 'bi-tag', label: '🏷️ Tag' },
    { value: 'bi-box', label: '📦 Package' }
  ];

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadCategory();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (err: any) {
      setError('Failed to load categories');
      console.error('Error loading categories:', err);
    }
  };

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${id}`);
      const category = response.data;
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || 'bi-folder',
        parentId: category.parentId || '',
        sortOrder: category.sortOrder || '',
        active: category.active !== undefined ? category.active : true
      });
    } catch (err: any) {
      setError('Failed to load category');
      console.error('Error loading category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? target.checked : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return false;
    }
    if (formData.name.length < 2) {
      setError('Category name must be at least 2 characters long');
      return false;
    }
    if (formData.name.length > 50) {
      setError('Category name must be less than 50 characters');
      return false;
    }
    if (formData.description && formData.description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }
    if (formData.sortOrder && (isNaN(Number(formData.sortOrder)) || Number(formData.sortOrder) < 0)) {
      setError('Sort order must be a positive number');
      return false;
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
      setSaving(true);
      const submitData = {
        ...formData,
        parentId: formData.parentId || null,
        sortOrder: formData.sortOrder ? Number(formData.sortOrder) : null
      };

      if (isEditing) {
        await api.put(`/categories/${id}`, submitData);
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/categories', submitData);
        setSuccess('Category created successfully!');
      }

      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save category');
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  const getAvailableParents = () => {
    if (isEditing) {
      // When editing, exclude the current category and its descendants
      return categories.filter(cat => cat.id !== Number(id));
    }
    return categories;
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
        <h2>{isEditing ? 'Edit Category' : 'Create New Category'}</h2>
        <Link to="/categories" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Categories
        </Link>
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

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col lg={8}>
                {/* Basic Information */}
                <div className="category-form-section">
                  <h5>Basic Information</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Category Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter category name"
                      maxLength={50}
                      required
                    />
                    <Form.Text className="text-muted">
                      {formData.name.length}/50 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter category description (optional)"
                      maxLength={500}
                    />
                    <Form.Text className="text-muted">
                      {formData.description.length}/500 characters
                    </Form.Text>
                  </Form.Group>
                </div>

                {/* Category Settings */}
                <div className="category-form-section">
                  <h5>Category Settings</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Parent Category</Form.Label>
                        <Form.Select
                          name="parentId"
                          value={formData.parentId}
                          onChange={handleChange}
                        >
                          <option value="">No Parent (Root Category)</option>
                          {getAvailableParents().map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Leave empty to create a root category
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort Order</Form.Label>
                        <Form.Control
                          type="number"
                          name="sortOrder"
                          value={formData.sortOrder}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                        />
                        <Form.Text className="text-muted">
                          Lower numbers appear first
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="active-switch"
                      name="active"
                      label="Active Category"
                      checked={formData.active}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      Inactive categories won't be visible to customers
                    </Form.Text>
                  </Form.Group>
                </div>
              </Col>

              <Col lg={4}>
                {/* Icon Selection */}
                <div className="category-form-section">
                  <h5>Category Icon</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Select Icon</Form.Label>
                    <Form.Select
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <div className="text-center p-3 border rounded">
                    <i className={`${formData.icon} fs-1`}></i>
                    <p className="mt-2 mb-0 text-muted">Preview</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="category-form-section">
                  <h5>Actions</h5>
                  
                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                          {isEditing ? 'Update Category' : 'Create Category'}
                        </>
                      )}
                    </Button>
                    
                    <Link to="/categories" className="btn btn-outline-secondary">
                      Cancel
                    </Link>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CategoryForm; 