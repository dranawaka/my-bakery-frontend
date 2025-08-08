import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const OrderStatusChart = ({ orders }) => {
  // Count orders by status
  const statusCounts = orders.reduce((acc, order) => {
    const status = order.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'PENDING': '#ffc107',
    'CONFIRMED': '#17a2b8',
    'PREPARING': '#007bff',
    'READY': '#28a745',
    'COMPLETED': '#20c997',
    'CANCELLED': '#dc3545',
    'REFUNDED': '#6c757d',
    'UNKNOWN': '#6c757d'
  };

  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(status => statusColors[status]),
        borderColor: Object.keys(statusCounts).map(status => statusColors[status]),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const totalOrders = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  if (totalOrders === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-0">No order data available</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: '200px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted">Total Orders:</span>
          <span className="fw-bold">{totalOrders}</span>
        </div>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle me-2"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: statusColors[status]
                }}
              ></div>
              <span className="small">{status}</span>
            </div>
            <span className="small fw-semibold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusChart; 