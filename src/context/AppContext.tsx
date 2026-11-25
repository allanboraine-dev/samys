'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BuyingMode, CartItem, Product, Order, OrderStatus, CustomerNotification } from '@/types';
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
  notifications: CustomerNotification[];
  unreadNotificationCount: number;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  products: Product[];
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  importProductsFromCsv: (
    incoming: Product[],
    replaceAll: boolean
  ) => { added: number; updated: number };
  updateProductStockQuantity: (productId: string, quantity: number) => void;
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
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(() =>
    INITIAL_PRODUCTS.map((p) => ({
      ...p,
      stockQuantity: p.stockQuantity ?? (p.inStock ? 50 : 0),
    }))
  );
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    const timer = setTimeout(() => {
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
        const savedNotifications = localStorage.getItem('sammys_notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        const savedProducts = localStorage.getItem('sammys_products');
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts) as Product[];
          setProducts(
            parsed.map((p) => ({
              ...p,
              stockQuantity: p.stockQuantity ?? (p.inStock ? 50 : 0),
            }))
          );
        }
      } catch {
        // Ignore local storage errors
      }
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('sammys_buying_mode', mode);
      localStorage.setItem('sammys_cart', JSON.stringify(cart));
      localStorage.setItem('sammys_orders', JSON.stringify(orders));
      localStorage.setItem('sammys_products', JSON.stringify(products));
      localStorage.setItem('sammys_notifications', JSON.stringify(notifications));
    } catch {
      // Ignore local storage errors
    }
  }, [mode, cart, orders, products, notifications, mounted]);

  // Sync orders & notifications across tabs (e.g. Manager updates status in /admin)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === 'sammys_orders' && e.newValue) {
          setOrders(JSON.parse(e.newValue));
        }
        if (e.key === 'sammys_notifications' && e.newValue) {
          setNotifications(JSON.parse(e.newValue));
        }
        if (e.key === 'sammys_products' && e.newValue) {
          setProducts(JSON.parse(e.newValue));
        }
      } catch {
        // Ignore cross-tab parse errors
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

  const buildOrderNotification = (
    order: Order,
    status: OrderStatus,
    isNewOrder: boolean
  ): CustomerNotification => {
    const pin = order.retailDetails?.collectionPin;
    if (isNewOrder) {
      return {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status,
        title: `Order ${order.orderNumber} Placed`,
        message:
          order.type === 'retail_click_collect'
            ? `Your Click & Collect order (R${order.total.toFixed(2)}) has been received.${pin ? ` Collection PIN: ${pin}.` : ''}`
            : `Your ${order.traderDetails?.isQuoteOnly ? 'Pro-Forma Quote' : 'Bulk Order'} (R${order.total.toFixed(2)}) has been received by Kimberley Dispatch.`,
        createdAt: new Date().toISOString(),
        read: false,
      };
    }

    const statusMessages: Record<OrderStatus, { title: string; message: string }> = {
      New: {
        title: `Order ${order.orderNumber} Received`,
        message: `Your order is queued for processing at Samy's Transvaal Road.`,
      },
      Picking: {
        title: `Order ${order.orderNumber} Being Picked`,
        message: `Floor staff are currently packing your items at Samy's Wholesalers.`,
      },
      'Ready for Collection': {
        title: `Order ${order.orderNumber} Ready for Collection!`,
        message:
          order.type === 'retail_click_collect'
            ? `Your order is packed and waiting at the Express Counter.${pin ? ` Show PIN: ${pin}.` : ''}`
            : `Your bulk order is staged at the Trader Dispatch Lane for loading.`,
      },
      Collected: {
        title: `Order ${order.orderNumber} Collected`,
        message: `Order completed. Thank you for shopping with Samy's Wholesalers!`,
      },
    };

    const details = statusMessages[status];
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status,
      title: details.title,
      message: details.message,
      createdAt: new Date().toISOString(),
      read: false,
    };
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setNotifications((prev) => [
      buildOrderNotification(order, order.status, true),
      ...prev,
    ]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (targetOrder && targetOrder.status !== status) {
      setNotifications((prev) => [
        buildOrderNotification(targetOrder, status, false),
        ...prev,
      ]);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const qty = Math.max(0, Math.floor(productData.stockQuantity ?? (productData.inStock ? 50 : 0)));
    const newProduct: Product = {
      ...productData,
      id: `sam-${Date.now()}`,
      stockQuantity: qty,
      inStock: qty > 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextQty =
          updates.stockQuantity !== undefined
            ? Math.max(0, Math.floor(updates.stockQuantity))
            : p.stockQuantity ?? (p.inStock ? 50 : 0);
        const nextInStock =
          updates.stockQuantity !== undefined
            ? nextQty > 0
            : updates.inStock ?? p.inStock;
        return {
          ...p,
          ...updates,
          stockQuantity: nextQty,
          inStock: nextInStock,
        };
      })
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const importProductsFromCsv = (
    incoming: Product[],
    replaceAll: boolean
  ): { added: number; updated: number } => {
    if (replaceAll) {
      setProducts(incoming);
      return { added: incoming.length, updated: 0 };
    }

    let added = 0;
    let updated = 0;
    const next = [...products];

    for (const item of incoming) {
      const existingIndex = next.findIndex(
        (p) =>
          p.id === item.id ||
          (p.name.toLowerCase() === item.name.toLowerCase() &&
            p.brand.toLowerCase() === item.brand.toLowerCase())
      );
      if (existingIndex !== -1) {
        next[existingIndex] = {
          ...next[existingIndex],
          ...item,
          id: next[existingIndex].id,
        };
        updated++;
      } else {
        next.unshift(item);
        added++;
      }
    }

    setProducts(next);
    return { added, updated };
  };

  const updateProductStockQuantity = (productId: string, quantity: number) => {
    const nextQty = Math.max(0, Math.floor(Number.isFinite(quantity) ? quantity : 0));
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stockQuantity: nextQty, inStock: nextQty > 0 }
          : p
      )
    );
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextInStock = !p.inStock;
        const currentQty = p.stockQuantity ?? (p.inStock ? 50 : 0);
        return {
          ...p,
          inStock: nextInStock,
          stockQuantity: nextInStock ? (currentQty > 0 ? currentQty : 25) : 0,
        };
      })
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
        notifications,
        unreadNotificationCount,
        isNotificationsOpen,
        setIsNotificationsOpen,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        products,
        orders,
        addOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        importProductsFromCsv,
        updateProductStockQuantity,
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
