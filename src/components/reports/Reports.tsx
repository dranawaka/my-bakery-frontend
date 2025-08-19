import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Button, 
  Table, 
  Badge, 
  Dropdown,
  ButtonGroup,
  Alert,
  Spinner,
  Tabs,
  Tab,
  ProgressBar
} from 'react-bootstrap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';
import { reportsService } from '../../services/reports';
import { 
  ReportData, 
  ReportFilter, 
  SalesDataPoint, 
  OrderStatusData, 
  ProductPerformance, 
  CustomerMetric, 
  CategoryRevenue, 
  DailyOrderData,
  InventoryLevel,
  FinancialMetric
} from '../../types';

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<ReportData>({
    salesData: [],
    orderStatusData: [],
    topProducts: [],
    customerMetrics: [],
    revenueByCategory: [],
    dailyOrders: [],
    inventoryLevels: [],
    financialMetrics: []
  });
  
  const [filters, setFilters] = useState<ReportFilter>({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    reportType: 'sales'
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await reportsService.getReportData(filters);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const exportReport = async (exportFormat: 'pdf' | 'excel' | 'csv') => {
    try {
      setLoading(true);
      const blob = await reportsService.exportReport(filters, exportFormat);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bakery-report-${filters.reportType}-${filters.startDate}-${filters.endDate}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(`Failed to export report: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: { [key: string]: string } = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Preparing': 'primary',
      'Ready': 'success',
      'Delivered': 'success',
      'low': 'danger',
      'normal': 'success',
      'high': 'warning',
      'out': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Reports & Analytics</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <ButtonGroup className="me-2">
            <Button 
              variant="outline-primary" 
              onClick={() => exportReport('pdf')}
              disabled={loading}
            >
              <i className="bi bi-file-pdf me-1"></i>PDF
            </Button>
            <Button 
              variant="outline-success" 
              onClick={() => exportReport('excel')}
              disabled={loading}
            >
              <i className="bi bi-file-earmark-excel me-1"></i>Excel
            </Button>
            <Button 
              variant="outline-info" 
              onClick={() => exportReport('csv')}
              disabled={loading}
            >
              <i className="bi bi-file-text me-1"></i>CSV
            </Button>
          </ButtonGroup>
        </div>
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
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Report Type</Form.Label>
                <Form.Select
                  value={filters.reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                >
                  <option value="sales">Sales Report</option>
                  <option value="orders">Order Analytics</option>
                  <option value="products">Product Performance</option>
                  <option value="customers">Customer Insights</option>
                  <option value="inventory">Inventory Report</option>
                  <option value="financial">Financial Report</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="primary" onClick={loadReportData} disabled={loading}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        {reportData.customerMetrics.map((metric, index) => (
          <Col key={index} md={3} className="mb-3">
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="text-muted mb-1">{metric.metric}</h6>
                    <h4 className="mb-0">{metric.value}</h4>
                  </div>
                  <div className="text-end">
                    <Badge 
                      bg={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'danger' : 'secondary'}
                      className="mb-1"
                    >
                      {metric.change}
                    </Badge>
                    <div>
                      <i className={`bi bi-arrow-${metric.trend === 'up' ? 'up' : metric.trend === 'down' ? 'down' : 'right'}-right text-${metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'danger' : 'secondary'}`}></i>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts and Tables */}
      <Tabs defaultActiveKey="sales" className="mb-4">
        <Tab eventKey="sales" title="Sales Analytics">
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Revenue & Orders Trend</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Revenue ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Revenue by Category</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {reportData.revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="orders" title="Order Analytics">
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Order Status Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.orderStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Daily Orders</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.dailyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="products" title="Product Performance">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Performing Products</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                    <th>Margin</th>
                    <th>Stock Level</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-semibold">{product.name}</div>
                      </td>
                      <td>
                        <Badge bg="secondary">{product.category}</Badge>
                      </td>
                      <td>{product.sales}</td>
                      <td>{formatCurrency(product.revenue)}</td>
                      <td>{formatCurrency(product.profit)}</td>
                      <td>{formatPercentage(product.profitMargin)}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(product.stockLevel > 20 ? 'normal' : product.stockLevel > 10 ? 'warning' : 'low')}>
                          {product.stockLevel}
                        </Badge>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${(product.sales / 50) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="customers" title="Customer Insights">
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Customer Growth Trend</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="customers" stroke="#8884d8" name="New Customers" />
                      <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Customer Metrics</h5>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <h2 className="text-primary mb-2">1,250</h2>
                    <p className="text-muted mb-3">Total Customers</p>
                    <div className="d-flex justify-content-between text-muted">
                      <span>New: 89</span>
                      <span>Active: 1,100</span>
                      <span>Inactive: 61</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="inventory" title="Inventory Report">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Inventory Levels & Alerts</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Point</th>
                    <th>Max Stock</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.inventoryLevels.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-semibold">{item.productName}</div>
                      </td>
                      <td>
                        <Badge bg="secondary">{item.category}</Badge>
                      </td>
                      <td>
                        <strong className={item.currentStock <= item.reorderPoint ? 'text-danger' : ''}>
                          {item.currentStock}
                        </strong>
                      </td>
                      <td>{item.reorderPoint}</td>
                      <td>{item.maxStock}</td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(item.status)}>
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {format(new Date(item.lastUpdated), 'MMM dd, yyyy')}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="financial" title="Financial Report">
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Financial Performance Trend</h5>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.financialMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                      <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
                      <Line type="monotone" dataKey="expenses" stroke="#ff8042" name="Expenses" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Key Metrics</h5>
                </Card.Header>
                <Card.Body>
                  {reportData.financialMetrics.map((metric, index) => (
                    <div key={index} className="mb-3">
                      <h6 className="text-muted mb-1">{metric.period}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Revenue: {formatCurrency(metric.revenue)}</span>
                        <Badge bg="success">{formatPercentage(metric.growthRate)}</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Profit: {formatCurrency(metric.profit)}</span>
                        <span className="text-muted">{formatPercentage(metric.profitMargin)}</span>
                      </div>
                      <ProgressBar 
                        now={(metric.profit / metric.revenue) * 100} 
                        className="mt-1" 
                        variant="success"
                      />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Reports; 