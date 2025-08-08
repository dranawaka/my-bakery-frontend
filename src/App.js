import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import ProductForm from './components/products/ProductForm';
import CategoryList from './components/categories/CategoryList';
import CategoryDetail from './components/categories/CategoryDetail';
import CategoryForm from './components/categories/CategoryForm';
import Cart from './components/cart/Cart';
import Checkout from './components/checkout/Checkout';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import CustomerList from './components/customers/CustomerList';
import InventoryList from './components/inventory/InventoryList';
import ReportList from './components/reports/ReportList';
import PromotionList from './components/promotions/PromotionList';
import UserList from './components/users/UserList';
import Settings from './components/settings/Settings';
import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductDetail />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/:id" element={<CategoryDetail />} />
              <Route path="categories/:id/edit" element={<CategoryForm />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="inventory" element={<InventoryList />} />
              <Route path="reports" element={<ReportList />} />
              <Route path="promotions" element={<PromotionList />} />
              <Route path="users" element={<UserList />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 