import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Badge, 
  Button, 
  Table, 
  Alert, 
  Spinner,
  Tabs,
  Tab,
  ListGroup
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import 'bootstrap-icons/font/bootstrap-icons.css';

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userResponse, addressesResponse] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/addresses`)
      ]);
      
      setUser(userResponse.data);
      setAddresses(addressesResponse.data || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'ADMIN': 'danger',
      'MANAGER': 'warning',
      'STAFF': 'info',
      'CUSTOMER': 'success'
    };
    return <Badge bg={roleColors[role] || 'secondary'}>{role}</Badge>;
  };

  const getStatusBadge = (active) => {
    return active ? 
      <Badge bg="success">Active</Badge> : 
      <Badge bg="secondary">Inactive</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="warning">
        User not found
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">User Details</h1>
        <div>
          <Button variant="outline-secondary" onClick={() => navigate('/users')} className="me-2">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Users
          </Button>
          <Button variant="primary" onClick={() => navigate(`/users/${id}/edit`)}>
            <i className="bi bi-pencil me-2"></i>
            Edit User
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* User Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">User Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                       style={{ width: '100px', height: '100px' }}>
                    <span className="text-white fw-bold" style={{ fontSize: '2rem' }}>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-center gap-1">
                    {getStatusBadge(user.active)}
                    {user.emailVerified && (
                      <Badge bg="success">
                        <i className="bi bi-check-circle-fill"></i>
                      </Badge>
                    )}
                  </div>
                </Col>
                <Col md={9}>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">First Name</label>
                        <div className="fw-semibold">{user.firstName || '-'}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Last Name</label>
                        <div className="fw-semibold">{user.lastName || '-'}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Email</label>
                        <div className="fw-semibold">{user.email}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Phone</label>
                        <div className="fw-semibold">{user.phone || '-'}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Role</label>
                        <div>{getRoleBadge(user.role)}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Status</label>
                        <div>{getStatusBadge(user.active)}</div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Created</label>
                        <div className="fw-semibold">{formatDate(user.createdAt)}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Last Updated</label>
                        <div className="fw-semibold">{formatDate(user.updatedAt)}</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Addresses */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Addresses ({addresses.length})</h5>
              <Button variant="outline-primary" size="sm">
                <i className="bi bi-plus me-1"></i>
                Add Address
              </Button>
            </Card.Header>
            <Card.Body>
              {addresses.length > 0 ? (
                <ListGroup variant="flush">
                  {addresses.map((address, index) => (
                    <ListGroup.Item key={address.id} className="d-flex justify-content-between align-items-start">
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">
                          {address.street}
                        </div>
                        <div className="text-muted">
                          {address.city}, {address.state} {address.zipCode}
                        </div>
                        <small className="text-muted">
                          {address.country}
                        </small>
                      </div>
                      <div>
                        <Button variant="outline-secondary" size="sm" className="me-1">
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-geo-alt text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No addresses found</p>
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
                <Button variant="outline-primary">
                  <i className="bi bi-envelope me-2"></i>
                  Send Email
                </Button>
                <Button variant="outline-success">
                  <i className="bi bi-telephone me-2"></i>
                  Call User
                </Button>
                <Button variant="outline-warning">
                  <i className="bi bi-key me-2"></i>
                  Reset Password
                </Button>
                <Button variant="outline-info">
                  <i className="bi bi-clock-history me-2"></i>
                  View Activity
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* User Statistics */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">User Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Total Orders</span>
                <Badge bg="primary">0</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Total Spent</span>
                <Badge bg="success">$0.00</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Last Order</span>
                <span className="text-muted">Never</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Member Since</span>
                <span className="text-muted">{formatDate(user.createdAt)}</span>
              </div>
            </Card.Body>
          </Card>

          {/* Account Status */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Account Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Email Verified</span>
                {user.emailVerified ? (
                  <Badge bg="success">Yes</Badge>
                ) : (
                  <Badge bg="warning">No</Badge>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Account Active</span>
                {getStatusBadge(user.active)}
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Two-Factor Auth</span>
                <Badge bg="secondary">Disabled</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Login History</span>
                <Button variant="link" size="sm" className="p-0">
                  View
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDetail; 