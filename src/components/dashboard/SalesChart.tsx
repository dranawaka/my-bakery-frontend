import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart: React.FC<{data: any}> = ({data }) => {
  // Normalize data to handle different formats
  const normalizedData = data.map(item => ({
    date: item.date || item.label || item.period,
    value: item.value || item.amount || item.sales || 0
  }));

  const chartData = {
    labels: normalizedData.map(item => item.date),
    datasets: [
      {
        label: 'Sales Revenue',
        data: normalizedData.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Sales: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6c757d',
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6c757d',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverBackgroundColor: 'rgb(75, 192, 192)',
        hoverBorderColor: '#fff',
      }
    }
  };

  if (normalizedData.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center">
          <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
          <p className="text-muted mt-2">No sales data available</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart; 