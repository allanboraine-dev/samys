'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuyingMode, CartItem, Product, Order, OrderStatus } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS } from '@/lib/mockData';

interface AppContextType {
  mode: BuyingMode;
  setMode: (mode: BuyingMode) => void;
  toggleMode: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, overrideMode?: BuyingMode) => void;
  removeFromCart: (productId: string, mode: BuyingMode) => void;
  updateQuantity: (productId: string, mode: BuyingMode, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  products: Product[];
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleProductStock: (productId: string) => void;
  toggleProductPromo: (productId: string) => void;
  reorderItems: (orderItems: Order['items']) => void;
  // Stats
  cartTotalCount: number;
  cartSubtotal: number;
  cartVat: number;
  cartBulkSavings: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<BuyingMode>('retail');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('sammys_buying_mode') as BuyingMode;
      if (savedMode === 'retail' || savedMode === 'trader') {
        setMode(savedMode);
      }
      const savedCart = localStorage.getItem('sammys_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedOrders = localStorage.getItem('sammys_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      const savedProducts = localStorage.getItem('sammys_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    } catch {
      // Ignore local storage errors
    }
    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sammys_buying_mode', mode);
      localStorage.setItem('sammys_cart', JSON.stringify(cart));
      localStorage.setItem('sammys_orders', JSON.stringify(orders));
      localStorage.setItem('sammys_products', JSON.stringify(products));
    } catch {
      // Ignore local storage errors
    }
  }, [mode, cart, orders, products, mounted]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'retail' ? 'trader' : 'retail'));
  };

  const addToCart = (product: Product, quantity = 1, overrideMode?: BuyingMode) => {
    const targetMode = overrideMode || mode;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.mode === targetMode
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, mode: targetMode }];
    });
  };

  const removeFromCart = (productId: string, itemMode: BuyingMode) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.mode === itemMode)));
  };

  const updateQuantity = (productId: string, itemMode: BuyingMode, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, itemMode);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.mode === itemMode) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const toggleProductPromo = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              isMonthEndSpecial: !p.isMonthEndSpecial,
              badge: !p.isMonthEndSpecial ? 'MONTH-END SPECIAL' : undefined,
            }
          : p
      )
    );
  };

  const reorderItems = (orderItems: Order['items']) => {
    orderItems.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.quantity, item.mode);
      }
    });
    setIsCartOpen(true);
  };

  // Calculations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const price =
      item.mode === 'retail'
        ? item.product.retailPrice
        : item.product.traderCasePrice;
    return sum + price * item.quantity;
  }, 0);

  // VAT in SA is standard 15% inclusive
  const cartVat = Number((cartSubtotal * (15 / 115)).toFixed(2));

  // Trader bulk savings estimated comparison
  const cartBulkSavings = cart.reduce((savings, item) => {
    if (item.mode === 'trader') {
      const retailEquivalent =
        item.product.retailPrice * item.product.caseUnitsCount * item.quantity;
      const traderPrice = item.product.traderCasePrice * item.quantity;
      return savings + Math.max(0, retailEquivalent - traderPrice);
    }
    return savings;
  }, 0);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        products,
        orders,
        addOrder,
        updateOrderStatus,
        toggleProductStock,
        toggleProductPromo,
        reorderItems,
        cartTotalCount,
        cartSubtotal,
        cartVat,
        cartBulkSavings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
