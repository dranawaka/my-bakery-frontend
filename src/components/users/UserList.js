import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Badge, 
  Form, 
  InputGroup, 
  Modal, 
  Alert, 
  Spinner,
  Dropdown,
  Pagination,
  Row,
  Col
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import UserForm from './UserForm';
import 'bootstrap-icons/font/bootstrap-icons.css';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
      setTotalPages(Math.ceil((response.data || []).length / itemsPerPage));
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  const handleUserSaved = () => {
    setShowModal(false);
    setSelectedUser(null);
    loadUsers();
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
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">User Management</h1>
        <Button variant="primary" onClick={handleCreateUser}>
          <i className="bi bi-plus-circle me-2"></i>
          Add User
        </Button>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search Users</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                  <option value="CUSTOMER">Customer</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>&nbsp;</Form.Label>
                <div>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setStatusFilter('');
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Users ({filteredUsers.length})</h5>
          <div className="d-flex align-items-center">
            <small className="text-muted me-3">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </small>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Phone</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '40px', height: '40px' }}>
                          <span className="text-white fw-bold">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="fw-semibold">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.emailVerified && (
                            <small className="text-success">
                              <i className="bi bi-check-circle-fill me-1"></i>
                              Verified
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.active)}</td>
                    <td>{user.phone || '-'}</td>
                    <td>
                      <small className="text-muted">
                        {formatDate(user.createdAt)}
                      </small>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                          <i className="bi bi-three-dots"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => navigate(`/users/${user.id}`)}>
                            <i className="bi bi-eye me-2"></i>
                            View Details
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditUser(user)}>
                            <i className="bi bi-pencil me-2"></i>
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            onClick={() => handleDeleteUser(user)}
                            className="text-danger"
                          >
                            <i className="bi bi-trash me-2"></i>
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {paginatedUsers.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
              <p className="text-muted mt-3">No users found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            />
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}

      {/* User Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserForm 
            user={selectedUser} 
            onSaved={handleUserSaved}
            onCancel={() => setShowModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserList; 