import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Form, Card, Button, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    sku: '',
    barcode: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
    images: [],
    active: true,
    featured: false
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [multipleImages, setMultipleImages] = useState([]);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        costPrice: product.costPrice || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        stockQuantity: product.stockQuantity || '',
        categoryId: product.category?.id || '',
        imageUrl: product.imageUrl || '',
        images: product.images || [],
        active: product.active !== false,
        featured: product.featured || false
      });

      // Set image preview if product has an image
      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }

      // Set multiple images if product has them
      if (product.images && product.images.length > 0) {
        setMultipleImages(product.images);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return false;
    }
    if (formData.stockQuantity && parseInt(formData.stockQuantity) < 0) {
      setError('Stock quantity cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const productData: any = {
        ...formData,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : 0
      };

      // Handle category properly - send category object instead of categoryId
      if (formData.categoryId) {
        const selectedCategory = categories.find(cat => cat.id === parseInt(formData.categoryId));
        if (selectedCategory) {
          productData.category = selectedCategory;
        }
        delete productData.categoryId; // Remove categoryId as backend expects category object
      }

      if (isEditing) {
        await api.put(`/products/${id}`, productData);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/products', productData);
        setSuccess('Product created successfully!');
      }

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/products');
      }, 1500);

    } catch (error) {
      console.error('Failed to save product:', error);
      setError(error.response?.data?.message || error.response?.data?.error?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('Image size must be less than 20MB');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await api.post('/upload/product-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Upload response:', response.data);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      // Check if response has the expected ApiResponse structure or direct data
      const uploadResult = response.data.data || response.data;
      console.log('Upload result:', uploadResult);
      console.log('Upload result keys:', uploadResult ? Object.keys(uploadResult) : 'null');
      
      if (uploadResult && (uploadResult.secureUrl || uploadResult.url)) {
        const imageUrl = uploadResult.secureUrl || uploadResult.url;
        setFormData(prev => ({
          ...prev,
          imageUrl: imageUrl
        }));
        console.log('Image URL set to:', imageUrl);
      } else {
        console.error('Invalid upload result:', uploadResult);
        console.error('secureUrl:', uploadResult?.secureUrl);
        console.error('url:', uploadResult?.url);
        setError('Upload response is invalid - no image URL received');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);

      // Reset progress after a delay
      setTimeout(() => setUploadProgress(0), 1000);

    } catch (error) {
      console.error('Failed to upload image:', error);
      setError(error.response?.data?.message || 'Failed to upload image');
      setUploadProgress(0);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter((file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select valid image files only');
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError('Image size must be less than 20MB');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploadingImage(true);
      setError('');

      const formData = new FormData();
      validFiles.forEach((file: File) => {
        formData.append('files', file);
      });

      const response = await api.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Multiple upload response:', response.data);
      
      // Check if response has the expected ApiResponse structure or direct data
      const uploadResults = response.data.data || response.data;
      if (!uploadResults || !Array.isArray(uploadResults)) {
        console.error('Invalid multiple upload response:', uploadResults);
        setError('Invalid upload response - expected array of results');
        return;
      }
      
      const newImageUrls = uploadResults
        .map(result => {
          const url = result.secureUrl || result.url;
          if (!url) {
            console.warn('Upload result missing URL:', result);
          }
          return url;
        })
        .filter(url => url);
      
      if (newImageUrls.length === 0) {
        setError('No valid image URLs received from upload');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }));

      setMultipleImages(prev => [...prev, ...newImageUrls]);

      setSuccess(`${validFiles.length} image(s) uploaded successfully!`);
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Failed to upload images:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeMultipleImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setMultipleImages(prev => prev.filter((_, i) => i !== index));
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/products" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Products
          </Link>
        </div>
        <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      </div>

      {/* Alerts */}
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
              {/* Basic Information */}
              <Col lg={8}>
                <h5 className="mb-3">Basic Information</h5>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SKU *</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="Enter SKU"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Barcode</Form.Label>
                      <Form.Control
                        type="text"
                        name="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        placeholder="Enter barcode"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>

              {/* Pricing and Inventory */}
              <Col lg={4}>
                <h5 className="mb-3">Pricing & Inventory</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>Sale Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cost Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {/* Image Upload Area */}
                  <div
                    className={`image-upload-area ${dragActive ? 'dragover' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    style={{
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color 0.3s ease',
                      backgroundColor: dragActive ? '#f8f9fa' : '#fff',
                      borderColor: dragActive ? '#007bff' : '#ccc'
                    }}
                  >
                    {/* Show preview if image exists */}
                    {(formData.imageUrl || imagePreview) ? (
                      <div className="position-relative">
                        <Image
                          src={imagePreview || formData.imageUrl}
                          alt="Product preview"
                          fluid
                          style={{
                            maxHeight: '200px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error('Failed to load image:', target.src);
                            target.style.display = 'none';
                            setError('Failed to load image preview');
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          title="Remove image"
                        >
                          <i className="bi bi-x"></i>
                        </Button>
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        {uploadingImage ? (
                          <div>
                            <Spinner animation="border" role="status" className="mb-2">
                              <span className="visually-hidden">Uploading...</span>
                            </Spinner>
                            <p className="mb-2">Uploading image...</p>
                            {uploadProgress > 0 && (
                              <div className="upload-progress">
                                <div 
                                  className="upload-progress-bar" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                            <p className="mb-2">Click to upload or drag and drop</p>
                            <p className="text-muted small mb-0">
                              PNG, JPG, GIF up to 20MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual URL input as fallback */}
                  <Form.Text className="text-muted mt-2">
                    Or enter image URL manually:
                  </Form.Text>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </Form.Group>

                {/* Multiple Images Gallery */}
                <Form.Group className="mb-3">
                  <Form.Label>Additional Images</Form.Label>
                  
                  {/* Hidden file input for multiple images */}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleMultipleImageUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="multiple-image-input"
                  />

                  {/* Upload button for multiple images */}
                  <div className="mb-3">
                    <Button
                      variant="outline-primary"
                      onClick={() => document.getElementById('multiple-image-input').click()}
                      disabled={uploadingImage}
                    >
                      <i className="bi bi-images me-2"></i>
                      {uploadingImage ? 'Uploading...' : 'Add More Images'}
                    </Button>
                    <Form.Text className="text-muted ms-2">
                      Select multiple images to create a gallery
                    </Form.Text>
                  </div>

                  {/* Image Gallery */}
                  {(formData.images.length > 0 || multipleImages.length > 0) && (
                    <div className="image-gallery">
                      <Row>
                        {(formData.images.length > 0 ? formData.images : multipleImages).map((imageUrl, index) => (
                          <Col key={index} xs={6} sm={4} md={3} className="mb-3">
                            <div className="position-relative">
                              <Image
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                fluid
                                style={{
                                  height: '120px',
                                  width: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                  border: '2px solid #dee2e6'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  console.error('Failed to load gallery image:', target.src);
                                  target.style.display = 'none';
                                }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => removeMultipleImage(index)}
                                title="Remove image"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  padding: '0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Settings */}
            <Row className="mt-4">
              <Col>
                <h5 className="mb-3">Settings</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        label="Active Product"
                      />
                      <Form.Text className="text-muted">
                        Inactive products won't be visible to customers
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleChange}
                        label="Featured Product"
                      />
                      <Form.Text className="text-muted">
                        Featured products will be highlighted
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Link to="/products" className="btn btn-secondary">
                Cancel
              </Link>
              <Button 
                type="submit" 
                variant="primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`bi bi-${isEditing ? 'check' : 'plus'}-circle me-2`}></i>
                    {isEditing ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductForm; 