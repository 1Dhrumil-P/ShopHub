import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [count, setCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'user') return;
    try {
      const { data } = await api.get('/cart');
      setCart(data);
      setCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      setCart({ items: [] });
      setCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user || user.role !== 'user') throw new Error('Not authorized');
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data);
    setCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
    setCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
  };

  const removeFromCart = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
    setCount(data.items.reduce((sum, item) => sum + item.quantity, 0));
  };

  return (
    <CartContext.Provider
      value={{ cart, count, fetchCart, addToCart, updateQuantity, removeFromCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
