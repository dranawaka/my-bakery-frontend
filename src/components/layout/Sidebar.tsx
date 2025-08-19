import React from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/products', icon: 'bi-box', label: 'Products' },
    { path: '/categories', icon: 'bi-folder', label: 'Categories' },
    { path: '/cart', icon: 'bi-cart3', label: 'Cart' },
    { path: '/inventory', icon: 'bi-clipboard-check', label: 'Inventory' },
    { path: '/orders', icon: 'bi-cart', label: 'Orders' },
    { path: '/customers', icon: 'bi-people', label: 'Customers' },
    { path: '/reports', icon: 'bi-graph-up', label: 'Reports' },
    { path: '/promotions', icon: 'bi-tag', label: 'Promotions' },
    { path: '/users', icon: 'bi-person', label: 'Users' },
    { path: '/settings', icon: 'bi-gear', label: 'Settings' },
  ];

  return (
    <nav className="sidebar">
      <div className="position-sticky pt-3">
        <div className="text-center mb-4">
          <h2>My Bakery</h2>
        </div>
        <ul className="nav flex-column">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={`${item.icon} me-2`}></i>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar; 