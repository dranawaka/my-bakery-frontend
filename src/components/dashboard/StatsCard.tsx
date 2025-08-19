import React from 'react';
import { Card } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  format?: string;
  trend?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({title, value, icon, color, format, trend }) => {
  const getIcon = (): React.ReactNode => {
    switch (icon) {
      case 'currency-dollar':
        return <i className="bi bi-currency-dollar fs-4"></i>;
      case 'cart':
        return <i className="bi bi-cart fs-4"></i>;
      case 'box':
        return <i className="bi bi-box fs-4"></i>;
      case 'people':
        return <i className="bi bi-people fs-4"></i>;
      case 'clock':
        return <i className="bi bi-clock fs-4"></i>;
      case 'exclamation-triangle':
        return <i className="bi bi-exclamation-triangle fs-4"></i>;
      case 'trending-up':
        return <span className="text-success">↗</span>;
      case 'trending-down':
        return <span className="text-danger">↘</span>;
      case 'graph-up':
        return <i className="bi bi-graph-up fs-4"></i>;
      case 'check-circle':
        return <i className="bi bi-check-circle fs-4"></i>;
      case 'x-circle':
        return <i className="bi bi-x-circle fs-4"></i>;
      default:
        return <i className="bi bi-box fs-4"></i>;
    }
  };

  const formatValue = (val: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getColorClass = (): string => {
    switch (color) {
      case 'primary':
        return 'bg-primary';
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'danger':
        return 'bg-danger';
      case 'info':
        return 'bg-info';
      case 'secondary':
        return 'bg-secondary';
      case 'dark':
        return 'bg-dark';
      case 'light':
        return 'bg-light text-dark';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card className="text-white mb-3 shadow-sm">
      <Card.Body className={getColorClass()}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title mb-1 opacity-75">{title}</h6>
            <h3 className="mb-0 fw-bold">{formatValue(value)}</h3>
            {trend && (
              <small className="d-flex align-items-center mt-1">
                {trend > 0 ? (
                  <span className="text-success me-1">
                    <i className="bi bi-arrow-up"></i>
                  </span>
                ) : (
                  <span className="text-danger me-1">
                    <i className="bi bi-arrow-down"></i>
                  </span>
                )}
                <span className="opacity-75">
                  {Math.abs(trend)}% from last month
                </span>
              </small>
            )}
          </div>
          <div className="opacity-75">
            {getIcon()}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard; 