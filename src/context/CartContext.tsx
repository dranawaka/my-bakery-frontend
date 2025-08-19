import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { Product, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<{ items: CartItem[] }>('/cart');
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (product: Product, quantity: number = 1): void => {
    const existingItemIndex = items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      setItems([...items, { product, quantity }]);
    }
  };

  const removeItem = (productId: string): void => {
    setItems(items.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(items.map(item => 
      item.product.id === productId 
        ? { ...item, quantity } 
        : item
    ));
  };

  const clearCart = (): void => {
    setItems([]);
  };

  const totalItems = items.reduce((count, item) => count + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 