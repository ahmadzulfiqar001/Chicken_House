import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string | number;
  menuItemId?: string;
  name: string;
  category?: string;
  variantLabel?: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: {
    variantLabel?: string;
    drink?: string;
    chutney?: string;
    spices?: string;
    instructions?: string;
    extras?: string[];
    items?: any[]; // For platters
  };
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  setQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('chicken_house_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('chicken_house_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getCartSignature = (item: CartItem) =>
    JSON.stringify({
      menuItemId: item.menuItemId ?? item.name,
      variantLabel: item.variantLabel ?? "",
      price: item.price,
      customizations: item.customizations ?? {},
    });

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const signature = getCartSignature(item);
      const existingItemIndex = prev.findIndex(i => 
        getCartSignature(i) === signature
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += item.quantity;
        return newCart;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const setQuantity = (id: string | number, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) } : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      setQuantity,
      clearCart,
      subtotal,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
