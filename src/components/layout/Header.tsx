import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 className="h2">Dashboard</h1>
      <div className="btn-toolbar mb-2 mb-md-0">
        <Link to="/cart" className="btn btn-sm btn-outline-primary me-2 text-decoration-none">
          <i className="bi bi-cart me-1"></i>
          Cart
          {totalItems > 0 && (
            <span className="badge bg-danger ms-1 cart-badge">{totalItems}</span>
          )}
        </Link>
        <div className="dropdown">
          <button 
            className="btn btn-sm btn-outline-secondary dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i className="bi bi-person-circle me-1"></i>
            <span>{user?.firstName || 'User'}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><a className="dropdown-item" href="#profile">Profile</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header; 