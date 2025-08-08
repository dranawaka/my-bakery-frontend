import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productOrId, quantity = 1) => {
    try {
      let productId;
      let itemQuantity = quantity;
      
      // Handle both product object and productId
      if (typeof productOrId === 'object') {
        productId = productOrId.id;
        itemQuantity = productOrId.quantity || quantity;
      } else {
        productId = productOrId;
      }
      
      const response = await api.post('/cart/items', {
        productId,
        quantity: itemQuantity
      });
      setCart(response.data.items || []);
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, {
        quantity
      });
      setCart(response.data.items || []);
      return response.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      setCart(response.data.items || []);
      return response.data;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart');
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartTotal,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 