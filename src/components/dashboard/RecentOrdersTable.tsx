import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const RecentOrdersTable: React.FC<{orders: any}> = ({orders }) => {
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'PENDING': 'warning',
      'CONFIRMED': 'info',
      'PREPARING': 'primary',
      'READY': 'success',
      'COMPLETED': 'success',
      'CANCELLED': 'danger',
      'REFUNDED': 'secondary'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getDeliveryMethodIcon = (method) => {
    return method === 'DELIVERY' ? '🚚' : '🏪';
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-0">No recent orders found</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Method</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 10).map((order) => (
            <tr key={order.id}>
              <td>
                <strong>{order.orderNumber}</strong>
              </td>
              <td>
                <div>
                  <div className="fw-semibold">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                  <small className="text-muted">{order.customer?.email}</small>
                </div>
              </td>
              <td>
                <span className="fw-semibold text-success">
                  {formatCurrency(order.totalAmount)}
                </span>
              </td>
              <td>
                {getStatusBadge(order.status)}
              </td>
              <td>
                <span title={order.deliveryMethod}>
                  {getDeliveryMethodIcon(order.deliveryMethod)}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  {formatDate(order.orderDate)}
                </small>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RecentOrdersTable; 