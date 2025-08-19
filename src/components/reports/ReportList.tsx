import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  ListGroup,
  ListGroupItem,
  Modal,
  Form,
  Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  lastGenerated?: string;
  status: 'active' | 'inactive';
}

const ReportList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily-sales',
      name: 'Daily Sales Report',
      description: 'Comprehensive daily sales summary with revenue, orders, and product performance',
      category: 'Sales',
      frequency: 'Daily',
      lastGenerated: '2024-01-15',
      status: 'active'
    },
    {
      id: 'weekly-inventory',
      name: 'Weekly Inventory Report',
      description: 'Stock levels, low stock alerts, and inventory turnover analysis',
      category: 'Inventory',
      frequency: 'Weekly',
      lastGenerated: '2024-01-12',
      status: 'active'
    },
    {
      id: 'monthly-financial',
      name: 'Monthly Financial Report',
      description: 'Revenue, expenses, profit margins, and financial performance metrics',
      category: 'Financial',
      frequency: 'Monthly',
      lastGenerated: '2023-12-31',
      status: 'active'
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics Report',
      description: 'Customer behavior, retention rates, and lifetime value analysis',
      category: 'Customer',
      frequency: 'Weekly',
      lastGenerated: '2024-01-10',
      status: 'active'
    },
    {
      id: 'product-performance',
      name: 'Product Performance Report',
      description: 'Top-selling products, category performance, and product profitability',
      category: 'Product',
      frequency: 'Weekly',
      lastGenerated: '2024-01-08',
      status: 'active'
    },
    {
      id: 'order-fulfillment',
      name: 'Order Fulfillment Report',
      description: 'Order processing times, delivery performance, and customer satisfaction',
      category: 'Operations',
      frequency: 'Daily',
      lastGenerated: '2024-01-15',
      status: 'active'
    }
  ];

  const handleScheduleReport = (report: ReportTemplate) => {
    setSelectedReport(report);
    setShowScheduleModal(true);
  };

  const handleGenerateReport = (report: ReportTemplate) => {
    // Navigate to the main reports page with the specific report type
    window.location.href = `/reports?type=${report.id}`;
  };

  const getCategoryBadgeVariant = (category: string) => {
    const variants: { [key: string]: string } = {
      'Sales': 'success',
      'Inventory': 'warning',
      'Financial': 'primary',
      'Customer': 'info',
      'Product': 'secondary',
      'Operations': 'dark'
    };
    return variants[category] || 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'success' : 'secondary';
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Report Management</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="me-2"
          >
            <i className="bi bi-plus-circle me-1"></i>Create Report
          </Button>
          <Button variant="outline-secondary">
            <i className="bi bi-gear me-1"></i>Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-primary mb-1">{reportTemplates.length}</h4>
              <p className="text-muted mb-0">Total Reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-success mb-1">
                {reportTemplates.filter(r => r.status === 'active').length}
              </h4>
              <p className="text-muted mb-0">Active Reports</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-info mb-1">6</h4>
              <p className="text-muted mb-0">Categories</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h4 className="text-warning mb-1">24</h4>
              <p className="text-muted mb-0">Generated Today</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Templates */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Available Report Templates</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {reportTemplates.map((report) => (
                  <Col key={report.id} lg={6} className="mb-3">
                    <Card className="h-100 border">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-1">{report.name}</h6>
                          <Badge bg={getStatusBadgeVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted small mb-2">{report.description}</p>
                        
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <Badge bg={getCategoryBadgeVariant(report.category)}>
                            {report.category}
                          </Badge>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {report.frequency}
                          </small>
                        </div>

                        {report.lastGenerated && (
                          <small className="text-muted d-block mb-3">
                            <i className="bi bi-calendar me-1"></i>
                            Last generated: {report.lastGenerated}
                          </small>
                        )}

                        <div className="d-flex gap-2">
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => handleGenerateReport(report)}
                          >
                            <i className="bi bi-play-circle me-1"></i>Generate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => handleScheduleReport(report)}
                          >
                            <i className="bi bi-clock me-1"></i>Schedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-info"
                          >
                            <i className="bi bi-eye me-1"></i>Preview
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Reports */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recently Generated Reports</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Daily Sales Report - Jan 15, 2024</h6>
                    <small className="text-muted">Generated at 9:00 AM</small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary">
                      <i className="bi bi-download me-1"></i>Download
                    </Button>
                    <Button size="sm" variant="outline-secondary">
                      <i className="bi bi-eye me-1"></i>View
                    </Button>
                  </div>
                </ListGroupItem>
                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Weekly Inventory Report - Jan 12, 2024</h6>
                    <small className="text-muted">Generated at 6:00 PM</small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary">
                      <i className="bi bi-download me-1"></i>Download
                    </Button>
                    <Button size="sm" variant="outline-secondary">
                      <i className="bi bi-eye me-1"></i>View
                    </Button>
                  </div>
                </ListGroupItem>
                <ListGroupItem className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Customer Analytics Report - Jan 10, 2024</h6>
                    <small className="text-muted">Generated at 3:00 PM</small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary">
                      <i className="bi bi-download me-1"></i>Download
                    </Button>
                    <Button size="sm" variant="outline-secondary">
                      <i className="bi bi-eye me-1"></i>View
                    </Button>
                  </div>
                </ListGroupItem>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Schedule Report Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Schedule Report: {selectedReport?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Frequency</Form.Label>
              <Form.Select>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control type="time" defaultValue="09:00" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Recipients</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter email addresses (comma separated)"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="Send as attachment" 
                defaultChecked 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Schedule Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Report Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Custom Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Custom reports allow you to create personalized analytics based on your specific business needs.
          </Alert>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Report Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter report name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select>
                    <option value="">Select category</option>
                    <option value="sales">Sales</option>
                    <option value="inventory">Inventory</option>
                    <option value="financial">Financial</option>
                    <option value="customer">Customer</option>
                    <option value="product">Product</option>
                    <option value="operations">Operations</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Describe what this report will show"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Source</Form.Label>
                  <Form.Select>
                    <option value="">Select data source</option>
                    <option value="orders">Orders</option>
                    <option value="products">Products</option>
                    <option value="customers">Customers</option>
                    <option value="inventory">Inventory</option>
                    <option value="financial">Financial Data</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Format</Form.Label>
                  <Form.Select>
                    <option value="chart">Chart</option>
                    <option value="table">Table</option>
                    <option value="both">Chart & Table</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary">
            Create Report
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReportList; 